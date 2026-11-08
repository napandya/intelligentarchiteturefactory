# ADR 0001: Go gateway in front of Python services, PostgreSQL as system of record

**Status:** Accepted (2026-07)
**Deciders:** iAF team + build agent

## Context

iAF needs: user file uploads, an agentic assistant that assembles per-request context,
and a path to enterprise-grade traffic. The existing single FastAPI process + MongoDB
served the prototype well but mixes auth, chat, and file handling in one module.

## Decision

- **Go (chi) gateway** owns the public edge on `/api/*`: routing, CORS, session/JWT
  verification, and reverse-proxying to internal services. Go chosen for a thin,
  high-throughput edge with trivial deployment (single static binary).
- **Python (FastAPI) services** own domain logic: auth, assistant, files. Python chosen
  for LLM/storage SDK ergonomics (emergentintegrations) and team familiarity.
- **PostgreSQL** is the system of record for users, sessions, file metadata, and chat
  history. Chosen for relational integrity (files ↔ users ↔ projects) and managed
  hosting ubiquity.
- **MongoDB remains** for the legacy backend until cutover; no new writes go there.

## Consequences

- + Clear service boundaries and OpenAPI-first contracts.
- + Gateway can enforce auth once, centrally.
- − Two languages to maintain; mitigated by specs and ADRs.
- − Postgres must be provisioned (docker-compose locally; managed instance in prod).
