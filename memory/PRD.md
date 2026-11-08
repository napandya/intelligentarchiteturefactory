# iAF Landing Page — PRD

## Original problem statement
Review the current UX/UI of Intelligent Architecture Factory (iAF). Using the v6 product video and the logo brainstorm, produce options for a landing page that highlights the knowledge graph, carries the Citi logo + iAF product logo, is ADA/WCAG compliant, and explains the product and its navigation in simple form. Follow-ups: three things must be clear — (1) Knowledge Assistant / chat with the knowledge graph, (2) the Permit-to-Design → Permit-to-Build flow, (3) the 13 Cards domains + architecture-diagram navigation. Deliver 2–3 complete page options, matching the current dark iAF product UI.

## Architecture
- React 19 + CRA (craco), FastAPI backend (stock, unused — page is static), MongoDB (unused)
- React Router: `/` chooser, `/a` Kinetic Knowledge Graph, `/b` Technical Blueprint, `/c` Editorial Enterprise
- framer-motion (reveals, masked lines, parallax), lenis (smooth scroll, disabled under reduced-motion), react-force-graph-3d (Option A hero)
- Design tokens in `/app/frontend/src/index.css` (iAF brand board palette), fonts: Cabinet Grotesk / IBM Plex Sans / IBM Plex Mono
- Shared components: `/app/frontend/src/components/shared.jsx` (logos, header, marquee, stats, permit flow, chat card, film section, footer)
- Assets in `/app/frontend/public/assets/`: real v6 MP4 + caption track (v6-captions.vtt), video frames (v6_*.jpg), cropped product screens (product-*.jpg)
- Design guidelines: `/app/design_guidelines.json`

## User personas
- Internal Citi architects / ARB members evaluating iAF
- Citi leadership watching the product story

## Core requirements (static)
1. Knowledge graph as the hero/story centerpiece
2. Knowledge Assistant (chat with the graph) explained
3. Permit-to-Design → Permit-to-Build journey (30–32 hrs → 6–8 hrs)
4. 13 Cards domains + diagram navigation explainer
5. Citi logo + iAF ligature logo (direction 02, shared-stem, blue-only palette)
6. ADA/WCAG AA: contrast-validated palette, focus rings, captions, landmarks, reduced-motion
7. 2–3 complete, comparable page options

## Implemented (2026-07)
- Direction chooser home page with three cards
- Option A: live 3D knowledge-graph hero, masked headline, domain marquee, stats, KG section, permit flow, assistant chat mock, navigation explainer, captioned v6 film
- Option B: blueprint/factory-floor direction, spec sheet, scrolly product figures, framed film
- Option C: editorial direction, massive type, panoramic film, pull quote, transformation table, numbered navigation explainer
- Accessibility: skip link, semantic landmarks, AA contrast, captions, reduced-motion support, data-testids

## Implemented (2026-07, v2)
- `/` is now THE landing page: scene-one loop of the v6 film as hero background (dimmed, with pause control), Citi + iAF ligature header, masked headline, and three cards — Knowledge Assistant, Permit journey, 13 domains — each deep-linking into the main page
- `/app` is the main workspace: Citi+iAF top bar with search, 13-domain sidebar (selectable), capability cards (Diagrams / Assessment / Risk / API Catalog), lifecycle tabs filtering the diagram table, Permit-to-Design→Build flow section, and a floating Knowledge Assistant panel (opens automatically via /app?open=assistant)
- Option pages still available at /options, /a, /b, /c

## Implemented (2026-07, v3)
- App deployed to production: https://iaf-graph.emergent.host (iaf.org DNS walkthrough pending with user)
- `/start` shell after "Enter iAF": three cards — Chat with Knowledge Assistant, Governance (Permit to Design/Build), USCC Knowledge Graph
- Full-screen Knowledge Assistant at /start → assistant card; REAL LLM answers via POST /api/assistant/chat (gpt-5.4, EMERGENT_LLM_KEY, system message seeded with 13-domain graph facts)
- Governance → Permit Dashboard (36 sample WR/PTS rows, filters/search) → Create Template → full-width Permit-to-Design editor with assistant drawer preloaded with project context
- USCC Knowledge Graph: 13-domain sidebar, no domain preselected, "select a domain" pill empty state; selecting shows capability cards + lifecycle-tabbed diagram table
- Logo: Direction 01 Monoline Vector (blue A) everywhere; official Citi webp logo in all headers
- /permits standalone page still exists (pre-Start version)

## Implemented (2026-07, v4)
- Citi logo removed everywhere — iAF brand only (Direction 01 Monoline Vector) in all headers/footers/favicon
- Deploy 2 dispatched (new /start flow + live assistant) — brand removal ships on next Deploy

## Implemented (2026-07, v5 — preview, pending Deploy)
- Google login gate: /start, /app, /permits protected via ProtectedRoute + /api/auth/me; /login page with "Continue with Google"; AuthCallback exchanges session_id; user chip in Start header; logout helper in Auth.jsx
- Trust citations: /api/assistant/chat returns sources (matched domains or governance context); chat renders "Sources:" chips under each answer
- Mobile bottom tab bar (Assistant / Permits / Graph) on the Start shell under lg; mobile domain select in graph view
- Production deploy 2 confirmed live (three-card flow + live assistant); brand removal + this batch pending next Deploy

## Implemented (2026-07, v6 — preview, pending Deploy)
- AppShell component: collapsible left nav on EVERY workspace page (logo→home, 3 nav items, user card + sign out, theme toggle, collapse/expand); mobile keeps bottom tab bar
- Light/dark theme: light is DEFAULT (data-theme attr, localStorage persisted); toggle in sidebar + mobile header
- Logo in sidebar is clickable → Home (onHome callback returns to cards view, no route remount bug)
- Answers to user's Qs: preview-vs-live difference was mid-work deploys; Create Template "black screen" not reproducible — editor + assistant drawer render; assistant IS docked in Create Template (verified)

## Implemented (2026-07, v7)
- Code pushed to GitHub: github.com/napandya/intelligentarchiteturefactory (commit c411bb6) — full history + README.md (stack, layout, flows, theming, a11y, roadmap), docs/ARCHITECTURE.md, docs/SEQUENCE.md (mermaid diagrams for auth, assistant, permit journey, graph explorer, theming)
- test_credentials.md intentionally git-ignored (sensitive); .emergent workspace state excluded
- iAF logo light-mode fix (navy strokes via --iaf-stroke) — in repo; ships on next Deploy
- Production redeploy confirmed live at intelligentarchitecture.org (left nav, light/dark, Home)

## Implemented (2026-07, v8 — preview, pending Deploy)
- File & media storage LIVE: upload/download/list/soft-delete via Emergent object storage (POST/GET/DELETE /api/files); verified end-to-end with real storage round-trip
- Assistant file context: uploaded PDF/TXT content folded into system message; citations include filename (verified: "Rewards & Loyalty has 90 APIs" answered from uploaded file, sources ['Rewards & Loyalty','test-upload.txt'])
- Upload UI: FileUpload/FileChip components in assistant chat, governance selection bar, permit editor
- backend-app/ platform (spec-driven, in repo e0c0da2): Go gateway (chi, builds+runs locally), FastAPI services (auth/assistant/files) with shared async SQLAlchemy + Postgres, docker-compose, OpenAPI gateway.yaml, knowledge-assistant.skill.md, ADR-0001
- Frontend chat supports SSE streaming (reads delta/done events) — ready when assistant service replaces legacy endpoint
- ChatGPT integration confirmed current (gpt-5.4 via EMERGENT_LLM_KEY)

## Backlog
- P0: Deploy this batch (uploads + file-grounded chat)
- P0: Cutover from legacy backend to backend-app gateway+services in production (needs Postgres provisioning)
- P0: www.intelligentarchitecture.org → bare redirect (requested from deployer)
- P1: Real Citi review data instead of the 36 sample projects
- P1: Persist assistant conversations (Mongo now; Postgres after cutover)
- P2: Team email allowlist (currently any Google account can enter)
- P2: Richer citations (per-fact source lines once the graph API returns structured sources)

## Next tasks
- Deploy current batch; verify uploads on production
- Provision Postgres and cut over to backend-app
