import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { CitiLogo, IAFMark, Reveal } from "../components/shared";

const OPTIONS = [
  {
    id: "a",
    title: "Kinetic Knowledge Graph",
    tag: "Immersive",
    desc: "A live 3D knowledge graph fills the hero — thirteen domains orbiting one source of truth, with a masked line-by-line headline reveal.",
    href: "/a",
  },
  {
    id: "b",
    title: "Technical Blueprint",
    tag: "Factory floor",
    desc: "A command-center spec sheet: blueprint grid, monospace metadata, and scrolling figures of the real workspace screens.",
    href: "/b",
  },
  {
    id: "c",
    title: "Editorial Enterprise",
    tag: "Authoritative",
    desc: "Big editorial type, a spotlighted panoramic film slot, and the before/after transformation table as the centerpiece.",
    href: "/c",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <main id="main" className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-16 sm:px-8">
        <header className="flex items-center gap-4">
          <CitiLogo className="h-7 w-auto" />
          <span className="h-6 w-px bg-[var(--line-strong)]" aria-hidden="true" />
          <div className="flex items-center gap-2.5">
            <IAFMark className="h-7 w-auto" />
            <span className="hidden text-sm font-medium tracking-wide md:block">Intelligent Architecture Factory</span>
          </div>
        </header>

        <div className="my-auto py-20">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--accent)]">
              Landing page directions · v6
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
              Three ways to tell the <span className="text-[var(--accent)]">iAF</span> story.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
              Same story — one knowledge graph, the permit journey, the Knowledge Assistant — told in three distinct
              directions. All built on the v6 film, all WCAG AA.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 md:grid-cols-3" data-testid="options-grid">
            {OPTIONS.map((o, i) => (
              <Reveal key={o.id} delay={0.15 + i * 0.12}>
                <Link
                  to={o.href}
                  data-testid={`option-card-${o.id}`}
                  className="group flex h-full flex-col border border-[var(--line)] bg-[var(--surface)] p-7 transition-[border-color,transform] duration-300 hover:-translate-y-1.5 hover:border-[var(--electric)]/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--electric)]">
                      Option {o.id.toUpperCase()}
                    </span>
                    <ArrowUpRight
                      size={18}
                      className="text-[var(--muted)] transition-[transform,color] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
                      aria-hidden="true"
                    />
                  </div>
                  <h2 className="mt-6 font-display text-2xl font-semibold text-[var(--ink)]">{o.title}</h2>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">{o.tag}</p>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--muted)]">{o.desc}</p>
                  <span className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">
                    View direction →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        <footer className="border-t border-[var(--line)] pt-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]/70">
            © 2026 Citigroup Inc. Internal concept work · iAF identity v0.1 — Ligature direction
          </p>
        </footer>
      </main>
    </div>
  );
}
