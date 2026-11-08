import asyncio
from contextlib import suppress
from datetime import timedelta
from fastapi import FastAPI, APIRouter, Query, Request, Response, HTTPException, UploadFile, File, Form
import httpx
import requests
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING, IndexModel
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# One entry per collection: every field a route filters, sorts or dedupes on. Add the index in the same edit as the query.
INDEXES: dict[str, list[IndexModel]] = {
    "status_checks": [
        IndexModel([("id", ASCENDING)], name="id", unique=True),
        IndexModel([("timestamp", DESCENDING)], name="timestamp_desc"),
    ],
}


async def ensure_indexes() -> None:
    for collection, models in INDEXES.items():
        for model in models:  # one at a time so a bad spec skips only itself
            try:
                await db[collection].create_indexes([model])
            except Exception as exc:  # never block boot on an index; the log line names what to fix
                logging.getLogger(__name__).error("ensure_indexes(%s.%s): %s", collection, model.document["name"], exc)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks(limit: int = Query(20, ge=1, le=100)):
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


DOMAINS_CONTEXT = [
    {"name": "Accounts Management & Servicing", "caps": ["Account Tokenization", "Merchant or Account Profile", "Product & Account Services"], "diagrams": 15, "apis": 577, "arb_review": 2},
    {"name": "Agentic Commerce", "caps": ["Delegated Checkout", "Agent Identity"], "diagrams": 6, "apis": 84, "arb_review": 1},
    {"name": "Collections & Recovery", "caps": ["Early-Stage Collections", "Recovery & Charge-off"], "diagrams": 9, "apis": 143, "arb_review": 0},
    {"name": "Credit Decisioning & Risk", "caps": ["Credit Decisioning", "Credit Bureau Integration"], "diagrams": 12, "apis": 62, "arb_review": 3},
    {"name": "Customer Onboarding & Acquisition", "caps": ["Application Intake", "KYC & Identity"], "diagrams": 11, "apis": 138, "arb_review": 1},
    {"name": "Data & Analytics", "caps": ["Reporting", "Feature Store"], "diagrams": 7, "apis": 96, "arb_review": 0},
    {"name": "Disputes & Fraud", "caps": ["Dispute Intake", "Fraud Detection"], "diagrams": 10, "apis": 121, "arb_review": 2},
    {"name": "Marketing & Sales", "caps": ["Campaign Management", "Offers"], "diagrams": 8, "apis": 77, "arb_review": 0},
    {"name": "Merchant & Partner Services", "caps": ["Partner Onboarding", "Settlement"], "diagrams": 9, "apis": 105, "arb_review": 1},
    {"name": "Miscellaneous", "caps": ["Shared Utilities"], "diagrams": 3, "apis": 41, "arb_review": 0},
    {"name": "Payments", "caps": ["Payment Posting", "Autopay"], "diagrams": 13, "apis": 212, "arb_review": 2},
    {"name": "Product Management", "caps": ["Product Catalog", "Pricing"], "diagrams": 5, "apis": 58, "arb_review": 0},
    {"name": "Rewards & Loyalty", "caps": ["Points Accrual", "Redemption"], "diagrams": 7, "apis": 90, "arb_review": 1},
]


def build_system_message(domain_context: str | None, file_sections: list | None = None) -> str:
    graph_summary = "\n".join(
        f"- {d['name']}: capabilities {', '.join(d['caps'])}; {d['diagrams']} diagrams; {d['apis']} APIs; {d['arb_review']} versions in ARB review"
        for d in DOMAINS_CONTEXT
    )
    base = (
        "You are the Knowledge Assistant for the Intelligent Architecture Factory (iAF), an internal Citi product "
        "for US Consumer Cards (USCC). You answer questions using the USCC knowledge graph below. "
        "iAF connects 13 core Cards domains, 577+ APIs and architecture diagrams into one knowledge graph, and runs "
        "the Permit-to-Design and Permit-to-Build governance journey (from ~30-32 hours manual down to 6-8 hours, "
        "with five specialized AI agents). Answer concisely and concretely, ground answers in the graph facts, and "
        "when relevant cite which domain the fact comes from. If you don't know something, say so plainly.\n\n"
        f"USCC KNOWLEDGE GRAPH (13 domains):\n{graph_summary}"
    )
    if domain_context:
        base += f"\n\nThe user is currently working on: {domain_context}. Tailor answers to help them."
    if file_sections:
        base += "\n\nATTACHED FILES:"
        for fname, text in file_sections:
            base += f"\n--- {fname} ---\n{text[:MAX_FILE_CHARS]}\n--- end {fname} ---"
    return base


class ChatRequest(BaseModel):
    message: str
    domain_context: str | None = None
    session_id: str | None = None
    file_ids: list[str] = []
    user_id: str | None = None


STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
MAX_FILE_CHARS = 8000

_storage_key: str | None = None


def init_storage(force: bool = False) -> str:
    """Call once at startup; force=True mints a new key if the old one went inactive."""
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": os.environ.get("EMERGENT_LLM_KEY", "")}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    if resp.status_code == 404:
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": init_storage(force=True), "Content-Type": content_type},
            data=data, timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str) -> tuple[bytes, str]:
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": init_storage(force=True)}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


def extract_text(data: bytes, content_type: str, filename: str) -> str:
    if content_type == "application/pdf" or filename.lower().endswith(".pdf"):
        try:
            import io

            from pypdf import PdfReader

            reader = PdfReader(io.BytesIO(data))
            return "\n".join((p.extract_text() or "") for p in reader.pages[:20])
        except Exception:
            return ""
    try:
        return data.decode("utf-8", errors="ignore")
    except Exception:
        return ""


@api_router.post("/assistant/chat")
async def assistant_chat(payload: ChatRequest):
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        return {"reply": "Assistant is not configured yet.", "sources": []}

    # Assemble attached-file context (spec: backend-app/specs/skills/knowledge-assistant.skill.md)
    file_sections: list[tuple[str, str]] = []
    file_sources: list[str] = []
    if payload.file_ids:
        records = await db.files.find(
            {"id": {"$in": payload.file_ids}, "is_deleted": False}, {"_id": 0}
        ).to_list(len(payload.file_ids))
        for rec in records:
            try:
                data = get_object(rec["storage_path"])[0]
                text = extract_text(data, rec.get("content_type", ""), rec.get("original_filename", ""))
                if text.strip():
                    file_sections.append((rec["original_filename"], text))
                    file_sources.append(rec["original_filename"])
            except Exception:
                continue

    chat = LlmChat(
        api_key=api_key,
        session_id=payload.session_id or f"iaf-{uuid.uuid4().hex[:12]}",
        system_message=build_system_message(payload.domain_context, file_sections),
    )
    response = await chat.send_message(UserMessage(text=payload.message))
    q = payload.message.lower()
    sources = [
        d["name"]
        for d in DOMAINS_CONTEXT
        if any(len(w) > 3 and w in q for w in d["name"].lower().replace("&", " ").split())
    ]
    if not sources and any(w in q for w in ("permit", "design", "build", "pts", "governance")):
        sources = ["Governance · Permit-to-Design"]
    if not sources:
        sources = ["USCC Knowledge Graph"]
    sources = sources[:3] + [s for s in file_sources if s not in sources[:3]]
    session_id = payload.session_id or f"iaf-{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    await db.chat_messages.insert_many([
        {"id": str(uuid.uuid4()), "user_id": payload.user_id or "anonymous", "session_id": session_id,
         "role": "user", "content": payload.message, "sources": "", "created_at": now},
        {"id": str(uuid.uuid4()), "user_id": payload.user_id or "anonymous", "session_id": session_id,
         "role": "assistant", "content": response, "sources": ",".join(sources), "created_at": now},
    ])
    return {"reply": response, "sources": sources, "session_id": session_id}


@api_router.get("/assistant/sessions")
async def assistant_sessions(request: Request):
    user = await get_current_user(request)
    pipeline = [
        {"$match": {"user_id": user["user_id"]}},
        {"$sort": {"created_at": -1}},
        {"$group": {
            "_id": "$session_id",
            "last_at": {"$first": "$created_at"},
            "first_user_msg": {"$last": "$content"},
            "count": {"$sum": 1},
        }},
        {"$sort": {"last_at": -1}},
        {"$limit": 50},
    ]
    rows = await db.chat_messages.aggregate(pipeline).to_list(50)
    return [
        {"session_id": r["_id"], "last_at": r["last_at"], "preview": (r["first_user_msg"] or "")[:80], "count": r["count"]}
        for r in rows
    ]


@api_router.get("/assistant/history")
async def assistant_history(request: Request, session_id: str = Query(...)):
    user = await get_current_user(request)
    rows = await db.chat_messages.find(
        {"user_id": user["user_id"], "session_id": session_id}, {"_id": 0}
    ).sort("created_at", 1).limit(100).to_list(100)
    return [
        {"role": m["role"], "text": m["content"], "sources": m["sources"].split(",") if m.get("sources") else []}
        for m in rows
    ]


MAX_UPLOAD_BYTES = 25 * 1024 * 1024


@api_router.post("/files")
async def upload_file(request: Request, file: UploadFile = File(...), context: str = Form("")):
    user = await get_current_user(request)
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 25 MB limit")
    ext = file.filename.split(".")[-1].lower() if "." in (file.filename or "") else "bin"
    path = f"iaf/uploads/{user['user_id']}/{uuid.uuid4()}.{ext}"
    result = put_object(path, data, file.content_type or "application/octet-stream")
    record = {
        "id": str(uuid.uuid4()),
        "user_id": user["user_id"],
        "storage_path": result["path"],
        "original_filename": file.filename or "file",
        "content_type": file.content_type or "application/octet-stream",
        "size": result.get("size", len(data)),
        "context": context,
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.files.insert_one(record)
    record.pop("_id", None)
    return record


@api_router.get("/files")
async def list_files(request: Request, context: str = Query("")):
    user = await get_current_user(request)
    query = {"user_id": user["user_id"], "is_deleted": False}
    if context:
        query["context"] = context
    rows = await db.files.find(query, {"_id": 0}).sort("created_at", -1).limit(200).to_list(200)
    return rows


@api_router.get("/files/{file_id}/download")
async def download_file(file_id: str, request: Request, auth: str = Query(None)):
    # img/link tags cannot send headers — allow ?auth=<token> fallback
    if auth and not request.cookies.get("session_token"):
        request.headers.__dict__["_list"].append((b"authorization", f"Bearer {auth}".encode()))
    user = await get_current_user(request)
    record = await db.files.find_one({"id": file_id, "is_deleted": False}, {"_id": 0})
    if not record or record["user_id"] != user["user_id"]:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(record["storage_path"])
    return Response(
        content=data,
        media_type=record.get("content_type") or content_type,
        headers={"Content-Disposition": f'attachment; filename="{record["original_filename"]}"'},
    )


@api_router.delete("/files/{file_id}")
async def delete_file(file_id: str, request: Request):
    user = await get_current_user(request)
    result = await db.files.update_one(
        {"id": file_id, "user_id": user["user_id"], "is_deleted": False},
        {"$set": {"is_deleted": True}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="File not found")
    return {"ok": True}


SESSION_DATA_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


async def get_current_user(request: Request):
    token = request.cookies.get("session_token")
    auth = request.headers.get("Authorization")
    if not token and auth and auth.startswith("Bearer "):
        token = auth.split(" ", 1)[1]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session id")
    async with httpx.AsyncClient(timeout=15) as client_http:
        r = await client_http.get(SESSION_DATA_URL, headers={"X-Session-ID": session_id})
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Could not verify session")
    data = r.json()
    email = data["email"]
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        user = {
            "user_id": f"user_{uuid.uuid4().hex[:12]}",
            "email": email,
            "name": data.get("name", ""),
            "picture": data.get("picture", ""),
            "created_at": datetime.now(timezone.utc),
        }
        await db.users.insert_one(user)
        user.pop("_id", None)
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": data["session_token"],
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc),
    })
    response.set_cookie(
        "session_token",
        data["session_token"],
        path="/",
        secure=True,
        httponly=True,
        samesite="none",
        max_age=7 * 24 * 3600,
    )
    return {"user_id": user["user_id"], "email": user["email"], "name": user["name"], "picture": user.get("picture", "")}


@api_router.get("/auth/me")
async def auth_me(request: Request):
    return await get_current_user(request)


@api_router.post("/auth/logout")
async def auth_logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_many({"session_token": token})
    response.delete_cookie("session_token", path="/", secure=True, samesite="none")
    return {"ok": True}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def start_index_build():
    app.state.index_task = asyncio.create_task(ensure_indexes())  # background: a big index build must not block boot

@app.on_event("shutdown")
async def shutdown_db_client():
    app.state.index_task.cancel()  # stop a build still running before its client closes
    with suppress(asyncio.CancelledError):
        await app.state.index_task
    client.close()