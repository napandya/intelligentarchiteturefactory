# iAF Sequence Diagrams

## 1. Sign-in (Emergent-managed Google OAuth)

```mermaid
sequenceDiagram
    actor User
    participant SPA as React SPA
    participant Auth as Emergent Auth (Google)
    participant API as FastAPI backend
    participant DB as MongoDB

    User->>SPA: Click "Enter iAF"
    SPA->>SPA: ProtectedRoute: GET /api/auth/me
    API-->>SPA: 401 (no session cookie)
    SPA->>User: Redirect to /login
    User->>SPA: Click "Continue with Google"
    SPA->>Auth: redirect: auth.emergentagent.com?redirect=<origin>/start
    Auth->>User: Google account chooser / consent
    Auth-->>SPA: 302 back to /start#session_id=...
    SPA->>API: POST /api/auth/session (X-Session-ID header)
    API->>Auth: GET /auth/v1/env/oauth/session-data
    Auth-->>API: { id, email, name, picture, session_token }
    API->>DB: upsert users; insert user_sessions (expires +7d)
    API-->>SPA: Set-Cookie: session_token (HttpOnly, Secure, SameSite=None)
    SPA->>SPA: strip hash → /start (signed in)
    Note over SPA,API: Every later page load calls GET /api/auth/me with the cookie
```

## 2. Knowledge Assistant (grounded chat with citations)

```mermaid
sequenceDiagram
    actor User
    participant Chat as ChatPanel
    participant API as FastAPI /api/assistant/chat
    participant LLM as GPT-5.4 (Emergent key)

    User->>Chat: Ask a question (optionally with domain context)
    Chat->>API: POST { message, domain_context }
    API->>API: build_system_message(DOMAINS_CONTEXT)
    API->>LLM: send_message(system + user)
    LLM-->>API: grounded answer text
    API->>API: match question → source domains (sources[])
    API-->>Chat: { reply, sources }
    Chat->>User: answer + "Sources:" citation chips
```

## 3. Permit-to-Design journey

```mermaid
sequenceDiagram
    actor User
    participant Shell as AppShell (Home)
    participant Gov as GovernanceView
    participant Editor as PermitEditorView
    participant Chat as Assistant drawer

    User->>Shell: Click "Governance · Permits"
    Shell->>Gov: render Permit Dashboard (projects + PTS)
    User->>Gov: Select a project row
    Gov->>User: Selection bar (project summary)
    User->>Gov: Click "Create Template"
    Gov->>Editor: open full-width Permit-to-Design (pre-filled fields)
    Editor->>Chat: open drawer with project context
    User->>Chat: Ask for scope / risks / impacted domains
    Chat->>Editor: answers grounded in graph (citations)
    User->>Editor: Complete sections → "Create draft permit"
```

## 4. Knowledge Graph explorer

```mermaid
sequenceDiagram
    actor User
    participant Nav as Left nav
    participant Graph as GraphView

    User->>Nav: Click "USCC Knowledge Graph"
    Nav->>Graph: render with NO domain selected (info pill)
    User->>Graph: Select one of the 13 domains
    Graph->>Graph: capability cards (diagrams, assessment, risk, API catalog)
    Graph->>User: lifecycle tabs → filtered diagram table
```

## 5. Theming

```mermaid
sequenceDiagram
    actor User
    participant Toggle as ThemeToggle
    participant DOM as document root
    participant LS as localStorage

    User->>Toggle: Click moon/sun
    Toggle->>DOM: data-theme = light | dark
    Toggle->>LS: persist iaf-theme
    DOM-->>User: all tokens swap (logo uses --iaf-stroke: navy on light, ink on dark)
```
