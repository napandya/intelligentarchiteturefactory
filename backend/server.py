import asyncio
from contextlib import suppress
from fastapi import FastAPI, APIRouter, Query
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


def build_system_message(domain_context: str | None) -> str:
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
    return base


class ChatRequest(BaseModel):
    message: str
    domain_context: str | None = None
    session_id: str | None = None


@api_router.post("/assistant/chat")
async def assistant_chat(payload: ChatRequest):
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        return {"reply": "Assistant is not configured yet."}
    chat = LlmChat(
        api_key=api_key,
        session_id=payload.session_id or f"iaf-{uuid.uuid4().hex[:12]}",
        system_message=build_system_message(payload.domain_context),
    )
    response = await chat.send_message(UserMessage(text=payload.message))
    return {"reply": response}

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