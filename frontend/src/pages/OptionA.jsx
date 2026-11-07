import { lazy, Suspense } from "react";
import { Header, MaskedLines, Eyebrow, Reveal, DomainsMarquee, StatsStrip, PermitFlow, ChatCard, CapabilitiesGrid, FilmSection, Footer } from "../components/shared";

const ForceGraph3D = lazy(() => import("react-force-graph-3d"));

const NODES = [];
const LINKS = [];
const DOMAIN_COLORS = ["#4C93FF", "#8FD0FF"];
(() => {
  NODES.push({ id: "kg", name: "Knowledge Graph", val: 14, color: "#2458E6" });
  const domains = [
    "Accounts", "Agentic Commerce", "Collections", "Credit Decisioning", "Onboarding",
    "Data & Analytics", "Disputes & Fraud", "Marketing", "Merchant Services", "Payments",
    "Product Mgmt", "Rewards", "Statements",
  ];
  domains.forEach((d, i) => {
    NODES.push({ id: d, name: d, val: 7, color: DOMAIN_COLORS[i % 2] });
    LINKS.push({ source: "kg", target: d });
    const apis = 2 + (i % 3);
    for (let a = 0; a < apis; a++) {
      const api = `${d}·API ${a + 1}`;
      NODES.push({ id: api, name: api, val: 2.5, color: "#8FD0FF" });
      LINKS.push({ source: d, target: api });
      if (a > 0) LINKS.push({ source: `${d}·API ${a}`, target: api });
    }
  });
})();

export default function OptionA() {
  return (
    <div className="bg-[var(--bg)] text-[var(--ink)]">
      <Header variant="a" />
      <main id="main">
        {/* HERO */}
        <section id="top" aria-labelledby="hero-a-heading" className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0" aria-hidden="true">
            <Suspense fallback={<div className="h-full w-full bg-[var(--bg)]" />}>
              <ForceGraph3D
                graphData={{ nodes: NODES, links: LINKS }}
                width={typeof window !== "undefined" ? window.innerWidth : 1400}
                height={typeof window !== "undefined" ? window.innerHeight : 900}
                backgroundColor="rgba(0,0,0,0)"
                nodeColor={(n) => n.color}
                nodeVal={(n) => n.val}
                linkColor={() => "rgba(76,147,255,0.22)"}
                linkWidth={0.6}
                enableNodeDrag={false}
                showNavInfo={false}
                cameraPosition={{ x: 0, y: 0, z: 320 }}
                nodeOpacity={0.9}
              />
            </Suspense>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-[var(--bg)]/60" />
          </div>
          <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 pt-16 sm:px-8">
            <Eyebrow>Intelligent Architecture Factory · US Consumer Cards</Eyebrow>
            <MaskedLines
              className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl"
              accentIndex={1}
              lines={["One knowledge graph.", "Every Cards domain.", "Always current."]}
            />
            <Reveal delay={0.7} className="mt-8 max-w-xl">
              <p className="text-lg leading-relaxed text-[var(--muted)]">
                Five AI agents on a single source of truth — answering questions in seconds and cutting permit cycle
                time from thirty hours to eight.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a
                  href="#film"
                  data-testid="hero-watch-film-a"
                  className="rounded-full bg-[var(--electric)] px-7 py-3.5 text-sm font-semibold text-[#070B14] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent)]"
                >
                  Watch the v6 film
                </a>
                <a
                  href="#graph"
                  data-testid="hero-explore-graph-a"
                  className="rounded-full border border-[var(--line-strong)] px-7 py-3.5 text-sm font-semibold text-[var(--ink)] transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)]"
                >
                  Explore the graph
                </a>
              </div>
            </Reveal>
            <p className="pointer-events-none absolute bottom-8 left-5 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]/70 sm:left-8">
              The graph behind this page is the product — 13 domains, 577 APIs, one truth
            </p>
          </div>
        </section>

        <DomainsMarquee />
        <section className="mx-auto max-w-7xl px-5 pt-20 sm:px-8" aria-label="Key figures">
          <Reveal>
            <StatsStrip />
          </Reveal>
        </section>

        {/* GRAPH SECTION */}
        <section id="graph" aria-labelledby="graph-heading-a" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <Reveal>
              <Eyebrow>01 · The knowledge graph</Eyebrow>
              <h2 id="graph-heading-a" className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                Scattered knowledge, fused into one graph.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--muted)]">
                ARB decisions, standards, static diagrams and expert knowledge were silos. iAF ingests them into one
                knowledge graph spanning all thirteen domains — so every review starts from the truth, not from scratch.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  "Core data ingestion: architecture, systems, delivery, risk",
                  "Every domain, capability, API and owner connected",
                  "Pre-deploy controls stop drift before production",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm text-[var(--muted)]">
                    <span className="node-pulse mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--electric)]" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.15}>
              <figure className="relative border border-[var(--line-strong)]">
                <img
                  src="/assets/v6_kg2.jpg"
                  alt="iAF knowledge graph diagram: core data ingestion sources feeding one knowledge graph that connects the thirteen core Cards domains"
                  className="w-full"
                />
                <figcaption className="border-t border-[var(--line)] bg-[var(--surface)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  One knowledge graph — every Cards domain, always current
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </section>

        {/* PERMITS */}
        <section id="permits" aria-labelledby="permits-heading-a" className="border-y border-[var(--line)] bg-[var(--surface)]/40">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
            <Reveal>
              <Eyebrow>02 · Permit to design · Permit to build</Eyebrow>
              <h2 id="permits-heading-a" className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                Same rigor. Without the drag.
              </h2>
            </Reveal>
            <Reveal delay={0.15} className="mt-12">
              <PermitFlow testid="permit-flow-a" />
            </Reveal>
          </div>
        </section>

        {/* ASSISTANT */}
        <section id="assistant" aria-labelledby="assistant-heading-a" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <Reveal>
              <Eyebrow>03 · The Knowledge Assistant</Eyebrow>
              <h2 id="assistant-heading-a" className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                Hours of digging. Now seconds.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--muted)]">
                Ask the graph anything — API coverage, risk posture, diagram status — and get an answer grounded in the
                knowledge graph, with sources cited.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <ChatCard testid="assistant-card-a" />
            </Reveal>
          </div>
        </section>

        {/* NAVIGATION */}
        <section id="navigation" aria-labelledby="nav-heading-a" className="border-y border-[var(--line)] bg-[var(--surface)]/40">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
            <Reveal>
              <Eyebrow>04 · Finding your way</Eyebrow>
              <h2 id="nav-heading-a" className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                Thirteen domains on the left. The truth on the right.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--muted)]">
                The workspace mirrors how architects think: pick a domain, open a capability, drill into diagrams — each
                with a lifecycle from draft to ARB-approved.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-10 lg:grid-cols-5">
              <Reveal className="lg:col-span-3">
                <figure className="border border-[var(--line-strong)]">
                  <img
                    src="/assets/product-diagrams.jpg"
                    alt="iAF workspace: domains sidebar beside diagram table with lifecycle statuses — draft, in review, approved, rejected"
                    className="w-full"
                  />
                </figure>
              </Reveal>
              <div className="lg:col-span-2">
                <CapabilitiesGrid testid="capabilities-grid-a" />
              </div>
            </div>
          </div>
        </section>

        <FilmSection variant="a" />
      </main>
      <Footer variant="a" />
    </div>
  );
}
