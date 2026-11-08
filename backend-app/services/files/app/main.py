"""iAF files service: uploads/downloads via Emergent object storage, metadata in Postgres."""
import os
import uuid
from datetime import datetime, timezone

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, Header, HTTPException, Query, Request, Response, UploadFile
from sqlalchemy import select

from shared.db import FileRecord, SessionLocal, init_db

load_dotenv()

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
APP_NAME = "iaf"
MAX_UPLOAD_BYTES = 25 * 1024 * 1024  # 25 MB

storage_key: str | None = None


def init_storage(force: bool = False) -> str:
    """Call ONCE at startup. force=True mints a new key if the old one went inactive."""
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


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
        resp = requests.get(f"{STORAGE_URL}/objects/{path}",
                            headers={"X-Storage-Key": init_storage(force=True)}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


app = FastAPI(title="iaf-files")


@app.on_event("startup")
async def startup() -> None:
    await init_db()
    try:
        init_storage()
    except Exception as e:
        print(f"storage init deferred: {e}")


@app.get("/api/files/health")
async def health() -> dict:
    return {"status": "ok", "service": "files"}


def current_user_id(request: Request) -> str:
    # Gateway injects X-User-ID after session verification; Bearer fallback for tests.
    uid = request.headers.get("X-User-ID")
    if uid:
        return uid
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return f"token:{auth.split(' ', 1)[1][:24]}"
    raise HTTPException(status_code=401, detail="Not authenticated")


@app.post("/api/files")
async def upload(request: Request, file: UploadFile = File(...), context: str = Form("")) -> dict:
    user_id = current_user_id(request)
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 25 MB limit")
    ext = file.filename.split(".")[-1].lower() if "." in (file.filename or "") else "bin"
    path = f"{APP_NAME}/uploads/{user_id}/{uuid.uuid4()}.{ext}"
    result = put_object(path, data, file.content_type or "application/octet-stream")
    record = FileRecord(
        user_id=user_id,
        storage_path=result["path"],
        original_filename=file.filename or "file",
        content_type=file.content_type or "application/octet-stream",
        size=result.get("size", len(data)),
        context=context,
    )
    async with SessionLocal() as db:
        db.add(record)
        await db.commit()
    return {
        "id": record.id,
        "original_filename": record.original_filename,
        "content_type": record.content_type,
        "size": record.size,
        "context": record.context,
        "created_at": record.created_at.isoformat(),
    }


@app.get("/api/files")
async def list_files(request: Request, context: str = Query("")) -> list[dict]:
    user_id = current_user_id(request)
    async with SessionLocal() as db:
        stmt = select(FileRecord).where(FileRecord.user_id == user_id, FileRecord.is_deleted.is_(False))
        if context:
            stmt = stmt.where(FileRecord.context == context)
        stmt = stmt.order_by(FileRecord.created_at.desc()).limit(200)
        rows = (await db.execute(stmt)).scalars().all()
    return [{
        "id": f.id,
        "original_filename": f.original_filename,
        "content_type": f.content_type,
        "size": f.size,
        "context": f.context,
        "created_at": f.created_at.isoformat(),
    } for f in rows]


@app.get("/api/files/{file_id}/download")
async def download(file_id: str, request: Request, auth: str = Query(None)) -> Response:
    _ = auth  # query-param auth is verified at the gateway; service trusts X-User-ID
    user_id = current_user_id(request)
    async with SessionLocal() as db:
        result = await db.execute(
            select(FileRecord).where(FileRecord.id == file_id, FileRecord.is_deleted.is_(False))
        )
        record = result.scalar_one_or_none()
    if not record or record.user_id != user_id:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(record.storage_path)
    return Response(
        content=data,
        media_type=record.content_type or content_type,
        headers={"Content-Disposition": f'attachment; filename="{record.original_filename}"'},
    )


@app.delete("/api/files/{file_id}")
async def delete_file(file_id: str, request: Request) -> dict:
    user_id = current_user_id(request)
    async with SessionLocal() as db:
        result = await db.execute(
            select(FileRecord).where(FileRecord.id == file_id, FileRecord.is_deleted.is_(False))
        )
        record = result.scalar_one_or_none()
        if not record or record.user_id != user_id:
            raise HTTPException(status_code=404, detail="File not found")
        record.is_deleted = True  # soft-delete: object storage has no delete API
        await db.commit()
    return {"ok": True}
