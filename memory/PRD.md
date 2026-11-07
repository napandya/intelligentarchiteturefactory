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

## Backlog
- P0: Add iaf.org custom domain in deployment UI + DNS at registrar (walk user through)
- P0: Login gate (Emergent Managed Google Auth) — user chose this; implementation planned but not yet built
- P1: Real Citi review data instead of the 36 sample projects
- P1: Persist assistant conversations in MongoDB
- P1: Replace recreated Citi/iAF SVG marks with official brand assets if available
- P2: Mobile nav drawer for option pages
- P2: Light-theme variant (brand board has a validated light palette)

## Next tasks
- Choose a direction and refine it (copy, imagery, density)
- Deploy chosen page
