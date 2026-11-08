"""iAF assistant service: agentic chat with context assembly + SSE streaming.

Behavior contract: specs/skills/knowledge-assistant.skill.md
"""
import io
import json
import os
import uuid

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import select

from shared.db import ChatMessage, FileRecord, SessionLocal, init_db

load_dotenv()

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
MODEL = ("openai", "gpt-5.4")
MAX_FILE_CHARS = 8000

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

storage_key: str | None = None


def init_storage(force: bool = False) -> str:
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def read_object(path: str) -> bytes:
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content


def extract_text(data: bytes, content_type: str, filename: str) -> str:
    if content_type == "application/pdf" or filename.lower().endswith(".pdf"):
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(data))
            return "\n".join((p.extract_text() or "") for p in reader.pages[:20])
        except Exception:
            return ""
    try:
        return data.decode("utf-8", errors="ignore")
    except Exception:
        return ""


def build_system_message(domain_context: str | None, file_sections: list[tuple[str, str]]) -> str:
    graph_summary = "\n".join(
        f"- {d['name']}: capabilities {', '.join(d['caps'])}; {d['diagrams']} diagrams; {d['apis']} APIs; {d['arb_review']} versions in ARB review"
        for d in DOMAINS_CONTEXT
    )
    base = (
        "You are the Knowledge Assistant for the Intelligent Architecture Factory (iAF), an internal Citi product "
        "for US Consumer Cards (USCC). You answer using the USCC knowledge graph below, the user's current screen "
        "context, and any attached files. iAF connects 13 core Cards domains, 577+ APIs and architecture diagrams "
        "into one knowledge graph, and runs the Permit-to-Design / Permit-to-Build governance journey "
        "(~30-32 hours manual, down to 6-8 hours with five AI agents).\n\n"
        "RULES:\n"
        "- Cite every fact as [source: X] where X is the domain or filename it came from.\n"
        "- If the answer depends on an attached file, quote the relevant line first.\n"
        "- If context is insufficient, ask ONE clarifying question instead of guessing.\n"
        "- Keep answers under 200 words unless asked for detail.\n"
        "- Never invent PTS numbers, API counts, or ARB decisions.\n\n"
        f"USCC KNOWLEDGE GRAPH (13 domains):\n{graph_summary}"
    )
    if domain_context:
        base += f"\n\nUSER'S CURRENT SCREEN CONTEXT: {domain_context}. Tailor answers to what they are doing."
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


app = FastAPI(title="iaf-assistant")


@app.on_event("startup")
async def startup() -> None:
    await init_db()


@app.get("/api/assistant/health")
async def health() -> dict:
    return {"status": "ok", "service": "assistant"}


def match_sources(question: str) -> list[str]:
    q = question.lower()
    sources = [d["name"] for d in DOMAINS_CONTEXT if any(w in q for w in d["name"].lower().split())]
    if not sources and any(w in q for w in ("permit", "design", "build", "pts", "governance")):
        sources = ["Governance · Permit-to-Design"]
    return (sources or ["USCC Knowledge Graph"])[:3]


@app.post("/api/assistant/chat")
async def chat(payload: ChatRequest, request: Request):
    from emergentintegrations.llm.chat import LlmChat, StreamDone, TextDelta, UserMessage

    user_id = request.headers.get("X-User-ID") or "anonymous"
    session_id = payload.session_id or f"iaf-{uuid.uuid4().hex[:12]}"

    # Assemble attached-file context (contract: skills/knowledge-assistant.skill.md)
    file_sections: list[tuple[str, str]] = []
    file_sources: list[str] = []
    if payload.file_ids:
        async with SessionLocal() as db:
            result = await db.execute(
                select(FileRecord).where(FileRecord.id.in_(payload.file_ids), FileRecord.is_deleted.is_(False))
            )
            records = result.scalars().all()
        for rec in records:
            try:
                data = read_object(rec.storage_path)
                text = extract_text(data, rec.content_type, rec.original_filename)
                if text.strip():
                    file_sections.append((rec.original_filename, text))
                    file_sources.append(rec.original_filename)
            except Exception:
                continue

    system = build_system_message(payload.domain_context, file_sections)
    sources = match_sources(payload.message) + [s for s in file_sources if s not in match_sources(payload.message)]

    llm = LlmChat(api_key=EMERGENT_KEY, session_id=session_id, system_message=system).with_model(*MODEL)

    async def event_stream():
        full = []
        try:
            async for event in llm.stream_message(UserMessage(text=payload.message)):
                if isinstance(event, TextDelta):
                    full.append(event.content)
                    yield f"event: delta\ndata: {json.dumps({'content': event.content})}\n\n"
                elif isinstance(event, StreamDone):
                    break
        except Exception as e:
            yield f"event: error\ndata: {json.dumps({'detail': str(e)[:200]})}\n\n"
            return
        reply = "".join(full)
        async with SessionLocal() as db:
            db.add(ChatMessage(user_id=user_id, session_id=session_id, role="user", content=payload.message))
            db.add(ChatMessage(user_id=user_id, session_id=session_id, role="assistant",
                               content=reply, sources=",".join(sources)))
            await db.commit()
        yield f"event: done\ndata: {json.dumps({'reply': reply, 'sources': sources, 'session_id': session_id})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/api/assistant/history")
async def history(request: Request, session_id: str):
    user_id = request.headers.get("X-User-ID") or "anonymous"
    async with SessionLocal() as db:
        result = await db.execute(
            select(ChatMessage)
            .where(ChatMessage.user_id == user_id, ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at)
            .limit(100)
        )
        rows = result.scalars().all()
    return [{"role": m.role, "content": m.content, "sources": m.sources.split(",") if m.sources else []} for m in rows]
