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
| gateway    | 8080 | Public edge: `/api/*` routing, session/JWT verify, CORS     |
| auth       | 8011 | Emergent OAuth exchange, session issuance, user profiles    |
| assistant  | 8012 | Agentic chat, context assembly, streaming SSE               |
| files      | 8013 | Uploads/downloads, metadata, soft-delete                    |
| postgres   | 5432 | Users, sessions, file metadata, chat history                |

The legacy single-process backend (`/app/backend`) stays running until traffic is cut over.
