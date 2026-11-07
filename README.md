# Intelligent Architecture Factory (iAF)

> One knowledge graph connecting all 13 US Consumer Cards domains — with five AI agents that run the Permit-to-Design → Permit-to-Build journey in hours, not days.

**Live:** https://intelligentarchitecture.org

iAF is an internal product for US Consumer Cards architecture. It fuses ARB decisions, standards, diagrams and expert knowledge into a single knowledge graph, then lets teams:

- **Chat with the Knowledge Assistant** — ask any domain, API, or risk question; answers are grounded in the graph and cite their sources.
- **Run Governance** — browse projects and their PTS in review, and generate a Permit-to-Design template pre-filled with graph context, with the assistant docked alongside.
- **Explore the USCC Knowledge Graph** — 13 Cards domains, capability cards, and every architecture diagram tracked from draft to ARB-approved.

## Tech stack

| Layer     | Tech                                                                 |
| --------- | -------------------------------------------------------------------- |
| Frontend  | React 19 (CRA + craco), Tailwind CSS, framer-motion, lenis           |
| Backend   | FastAPI (Python), MongoDB (motor), emergentintegrations (LLM)        |
| Auth      | Emergent-managed Google OAuth, 7-day httpOnly session cookie          |
| Assistant | GPT-5.4 via the Emergent universal key, grounded on graph context     |
| Hosting   | Emergent (preview + production at intelligentarchitecture.org)        |

## Repository layout

```
/app
├── backend/
│   ├── server.py            # FastAPI app: auth, assistant chat, status APIs
│   ├── requirements.txt     # Python deps (emergentintegrations, motor, httpx)
│   └── .env                 # MONGO_URL, DB_NAME, EMERGENT_LLM_KEY (never commit)
├── frontend/
│   ├── public/
│   │   ├── index.html       # fonts + meta
│   │   ├── favicon.svg      # iAF monoline vector mark
│   │   └── assets/          # v6 film, scene loop, product screenshots
│   └── src/
│       ├── App.js           # router, smooth scroll, auth callback routing
│       ├── index.css        # design tokens (light/dark), base styles
│       ├── components/
│       │   ├── AppShell.jsx     # collapsible left nav shell (every workspace page)
│       │   ├── Auth.jsx         # Google sign-in, callback, ProtectedRoute, logout
│       │   ├── ThemeToggle.jsx  # light/dark hook + toggle button
│       │   ├── shared.jsx       # brand marks, marquee, cards, film, footer
│       │   └── ui/              # shadcn primitives
│       └── pages/
│           ├── Landing.jsx      # public landing (film hero, three cards)
│           ├── Login.jsx        # sign-in screen
│           ├── Start.jsx        # signed-in Home + Assistant + Governance + Graph
│           ├── Workspace.jsx    # legacy workspace view
│           ├── Permits.jsx      # standalone permit dashboard
│           └── OptionA/B/C.jsx  # landing concept directions (kept for reference)
├── docs/
│   ├── ARCHITECTURE.md      # component + data flow architecture
│   └── SEQUENCE.md          # sequence diagrams for core flows
└── memory/
    ├── PRD.md               # product record: decisions, backlog
    └── test_credentials.md  # test identities for automation
```

## Running locally

```bash
# Backend (port 8001)
cd backend
pip install -r requirements.txt
# .env needs: MONGO_URL, DB_NAME, EMERGENT_LLM_KEY
uvicorn server:app --host 0.0.0.0 --port 8001

# Frontend (port 3000)
cd frontend
yarn install
yarn start
```

All backend routes are prefixed `/api` and the frontend calls them via `REACT_APP_BACKEND_URL`.

## Core flows

1. **Sign-in** — `Enter iAF` → `/login` → Emergent Google OAuth → `POST /api/auth/session` → httpOnly `session_token` cookie → `/start`.
2. **Assistant** — question → `POST /api/assistant/chat` (system message seeded with the 13-domain graph) → reply + `sources[]` rendered as citation chips.
3. **Permit journey** — Governance dashboard → select a project → **Create Template** → full-width Permit-to-Design editor with the assistant drawer preloaded with that project's context.
4. **Graph explorer** — pick one of 13 domains → capability cards + lifecycle-tabbed diagram table.

Detailed diagrams: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/SEQUENCE.md](docs/SEQUENCE.md).

## Theming & brand

- Light mode is the default; the toggle persists to `localStorage` (`iaf-theme`). Tokens live in `frontend/src/index.css` (`:root` / `[data-theme="light"]`).
- Product mark: **Monoline Vector** (direction 01 of the iAF brand board). Letterforms are `#EEF3FF` on dark and Navy `#0B1F4D` on light, driven by the `--iaf-stroke` / `--iaf-accent` CSS variables.

## Accessibility

WCAG 2.2 AA contrast pairs from the iAF brand board, keyboard focus rings, skip links, semantic landmarks, captions on the product film, and reduced-motion support throughout.

## Data notice

Projects, diagrams and API counts in the workspace are currently **sample data** standing in for the live Citi review feeds. Do not commit real Citi data or secrets; `.env` files are git-ignored.

## Roadmap

- [ ] Real review/PTS data feed (replace sample projects)
- [ ] Team email allowlist for sign-in
- [ ] Persist assistant conversations in MongoDB
- [ ] `www.intelligentarchitecture.org` → bare-domain redirect
