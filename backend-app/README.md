# iAF Backend — Service Platform

This directory contains the iAF backend platform, built with spec-driven development.

## Stack

| Layer            | Tech                                                |
| ---------------- | --------------------------------------------------- |
| API gateway      | Go 1.22 (chi router) — routing, JWT verify, proxy   |
| Services         | Python 3.12, FastAPI                                |
| Database         | PostgreSQL 16 (SQLAlchemy async)                    |
| Object storage   | Emergent object storage (S3-compatible proxy)       |
| LLM              | OpenAI GPT-5.4 via Emergent universal key           |

## Layout

```
backend-app/
├── specs/
│   ├── openapi/            # API contracts (source of truth)
│   │   ├── gateway.yaml        # gateway surface (public)
│   │   ├── auth.yaml           # auth service
│   │   ├── assistant.yaml      # assistant service
│   │   └── files.yaml          # files service
│   ├── skills/             # agent skills (spec-driven behavior)
│   │   ├── knowledge-assistant.skill.md
│   │   └── permit-drafter.skill.md
│   └── adr/                # architecture decision records
│       └── 0001-gateway-go-python-services.md
├── gateway/                # Go API gateway
│   ├── cmd/gateway/main.go
│   ├── internal/
│   │   ├── authn/          # JWT/session verification
│   │   ├── proxy/          # reverse proxy to services
│   │   └── config/
│   ├── go.mod
│   └── Dockerfile
├── services/
│   ├── auth/               # session issuance, user records
│   │   ├── app/main.py
│   │   └── requirements.txt
│   ├── assistant/          # agentic chat: context assembly + streaming
│   │   ├── app/main.py
│   │   └── requirements.txt
│   └── files/              # upload/download + metadata (Postgres + objstore)
│       ├── app/main.py
│       └── requirements.txt
├── docker-compose.yml      # local dev: postgres + services + gateway
└── README.md               # this file
```

## Spec-driven development

1. **Contracts first.** Every endpoint exists in `specs/openapi/*.yaml` before code. Services are generated/reviewed against these specs.
2. **Skills are specs too.** Agent behaviors (system prompt, tools, context policy) are versioned markdown specs in `specs/skills/`.
3. **ADRs** record significant decisions (why Go gateway, why Postgres, etc.).
4. Changes to behavior start with a spec edit, then code, then verification against the spec.

## Service map

| Service    | Port | Owns                                                        |
| ---------- | ---- | ----------------------------------------------------------- |
| gateway    | 8090 | Public edge: `/api/*` routing, session/JWT verify, CORS     |
| auth       | 8021 | Emergent OAuth exchange, session issuance, user profiles    |
| assistant  | 8022 | Agentic chat, context assembly, streaming SSE               |
| files      | 8023 | Uploads/downloads, metadata, soft-delete                    |
| postgres   | 5432 | Users, sessions, file metadata, chat history                |

The legacy single-process backend (`/app/backend`) stays running until traffic is cut over.

## Validation status (2026-11)

End-to-end validated locally in the dev pod (Postgres 15 + 3 services + gateway):

- `GET /api/health` through gateway → OK
- `GET /api/auth/me` with Postgres-backed session → user profile OK
- `POST /api/files` upload → object storage OK; metadata row in Postgres `files`
- `GET /api/files` + `GET /api/files/{id}/download` → OK (round-trip verified)
- `POST /api/assistant/chat` → SSE `delta`/`done` events stream through the gateway; reply + sources; history persisted in Postgres `chat_messages`

Production cutover checklist:

1. Provision managed Postgres; set `DATABASE_URL` on all three services.
2. Deploy gateway as the public edge (or run behind the existing ingress); set `*_SERVICE_URL` env vars.
3. Migrate `users`/`sessions`/`files` from MongoDB to Postgres (one-off script).
4. Repoint frontend `REACT_APP_BACKEND_URL` at the gateway; verify sign-in round trip.
5. Retire the legacy backend after a soak period.
