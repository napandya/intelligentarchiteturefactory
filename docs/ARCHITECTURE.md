# iAF Architecture

## System context

```
┌──────────────┐        ┌─────────────────────────────┐        ┌──────────────────┐
│   Browser    │  HTTPS │  Emergent-hosted app         │        │ Emergent Auth     │
│ (React SPA)  ├───────▶│  React frontend + FastAPI    ├───────▶│ (Google OAuth)    │
└──────┬───────┘        │  backend under /api          │        └──────────────────┘
       │                └──────┬───────────┬───────────┘
       │                       │           │
       │                ┌──────▼─────┐  ┌──▼───────────────┐
       │                │  MongoDB   │  │ Emergent LLM key │
       │                │ users,     │  │ → GPT-5.4        │
       │                │ sessions   │  │ (assistant)      │
       │                └────────────┘  └──────────────────┘
       │
       ▼
static assets: v6 film, scene-one loop, product screenshots (/public/assets)
```

## Frontend structure

```
App.js
├── SmoothScroll (lenis; disabled under prefers-reduced-motion)
├── ScrollToTop
└── AppRouter
    ├── hash contains session_id? → AuthCallback → /start
    ├── /              → Landing (public)
    ├── /login         → Login (public)
    ├── /start         → ProtectedRoute → Start (Home / Assistant / Governance / Editor / Graph)
    ├── /app           → ProtectedRoute → Workspace (legacy)
    ├── /permits       → ProtectedRoute → Permits (standalone dashboard)
    └── /options, /a, /b, /c → landing concept directions (public, reference)

Start.jsx (signed-in home)
└── AppShell (collapsible left nav + mobile bottom tabs + theme toggle + user card)
    ├── CardsView        → three entry cards
    ├── AssistantView    → ChatPanel (full screen)
    ├── GovernanceView   → projects table → Create Template
    ├── PermitEditorView → full-width editor + ChatPanel drawer (project context)
    └── GraphView        → 13-domain rail → capability cards → diagram table
```

### Component conventions

- **Pages** own data and state; **components** are presentational. Shared visual primitives (brand marks, cards, marquee) live in `components/shared.jsx`; app chrome lives in `components/AppShell.jsx`.
- **Auth is a component concern**: `components/Auth.jsx` exports `SignInCard`, `AuthCallback`, `ProtectedRoute`, and `logout`. No page talks to the auth endpoints directly.
- **Theming via CSS variables only** (`index.css`): components reference `var(--bg)`, `var(--surface)`, `var(--ink)`… never hardcoded hex. Light/dark is one attribute on `<html>` (`data-theme`), persisted in `localStorage`.
- **data-testid on every interactive element**, kebab-case, stable across refactors.
- Icons: `lucide-react`. Motion: `framer-motion` with `useReducedMotion()` fallbacks.

## Backend structure (`backend/server.py`)

```
/api
├── GET  /                      health
├── GET/POST /status            sample status collection
├── POST /auth/session          exchange Emergent session_id → user + 7-day cookie
├── GET  /auth/me               current user from cookie or Bearer token (401 otherwise)
├── POST /auth/logout           delete session, clear cookie
└── POST /assistant/chat        LlmChat (GPT-5.4) grounded on DOMAINS_CONTEXT; returns { reply, sources }
```

### Data model

| Collection       | Document                                              |
| ---------------- | ----------------------------------------------------- |
| `users`          | `user_id`, `email`, `name`, `picture`, `created_at`   |
| `user_sessions`  | `user_id`, `session_token`, `expires_at`, `created_at`|
| `status_checks`  | sample collection from the template                   |

## Trust boundaries

- Only `POST /api/auth/session` talks to the Emergent auth service (`X-Session-ID` header, server-side).
- The LLM key (`EMERGENT_LLM_KEY`) never leaves the backend; the browser only sees the reply + sources.
- Session cookie: `HttpOnly; Secure; SameSite=None; Max-Age=7d`. Bearer-token fallback exists for API clients/tests.
- Sample workspace data (projects, diagrams, API counts) is hardcoded frontend constants until the real review feed lands.
