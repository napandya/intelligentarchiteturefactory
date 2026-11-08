"""iAF auth service: Emergent OAuth exchange, session issuance, user profiles."""
import os
import uuid
from datetime import datetime, timedelta, timezone

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Response
from sqlalchemy import select

from shared.db import Session, SessionLocal, User, init_db

load_dotenv()

SESSION_DATA_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
SESSION_TTL_DAYS = 7

app = FastAPI(title="iaf-auth")


@app.on_event("startup")
async def startup() -> None:
    await init_db()


@app.get("/api/auth/health")
async def health() -> dict:
    return {"status": "ok", "service": "auth"}


@app.post("/api/auth/session")
async def create_session(request: Request, response: Response) -> dict:
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session id")
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(SESSION_DATA_URL, headers={"X-Session-ID": session_id})
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Could not verify session")
    data = r.json()
    email = data["email"]
    async with SessionLocal() as db:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user:
            user = User(user_id=f"user_{uuid.uuid4().hex[:12]}", email=email,
                        name=data.get("name", ""), picture=data.get("picture", ""))
            db.add(user)
        db.add(Session(
            session_token=data["session_token"],
            user_id=user.user_id,
            expires_at=datetime.now(timezone.utc) + timedelta(days=SESSION_TTL_DAYS),
        ))
        await db.commit()
        profile = {"user_id": user.user_id, "email": user.email, "name": user.name, "picture": user.picture}
    response.set_cookie(
        "session_token", data["session_token"], path="/",
        secure=True, httponly=True, samesite="none", max_age=SESSION_TTL_DAYS * 24 * 3600,
    )
    return profile


async def resolve_user(request: Request) -> User:
    token = request.cookies.get("session_token")
    auth = request.headers.get("Authorization", "")
    if not token and auth.startswith("Bearer "):
        token = auth.split(" ", 1)[1]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    async with SessionLocal() as db:
        result = await db.execute(select(Session).where(Session.session_token == token))
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=401, detail="Invalid session")
        expires = session.expires_at
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if expires < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expired")
        result = await db.execute(select(User).where(User.user_id == session.user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user


@app.get("/api/auth/me")
async def me(request: Request) -> dict:
    user = await resolve_user(request)
    return {"user_id": user.user_id, "email": user.email, "name": user.name, "picture": user.picture}


@app.post("/api/auth/logout")
async def logout(request: Request, response: Response) -> dict:
    token = request.cookies.get("session_token")
    if token:
        async with SessionLocal() as db:
            result = await db.execute(select(Session).where(Session.session_token == token))
            session = result.scalar_one_or_none()
            if session:
                await db.delete(session)
                await db.commit()
    response.delete_cookie("session_token", path="/", secure=True, samesite="none")
    return {"ok": True}
