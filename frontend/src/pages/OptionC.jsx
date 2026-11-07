import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Header, MaskedLines, Eyebrow, Reveal, DomainsMarquee, ChatCard, FilmSection, Footer, CitiLogo, IAFMark } from "../components/shared";

const TRANSFORMATION = [
  ["Permits", "30–32 hrs", "6–8 hrs (auto)"],
  ["Knowledge", "Fragmented silos", "1 connected graph"],
  ["Drift control", "Post-deploy audits", "Automated controls pre-deploy"],
  ["Diagrams", "Static / manual", "Architecture-as-code"],
];

export default function OptionC() {
  const heroRef = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const frameY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 90]);

  return (
    <div className="bg-[var(--bg)] text-[var(--ink)]">
      <Header variant="c" />
      <main id="main">
        {/* EDITORIAL HERO */}
        <section id="top" ref={heroRef} aria-labelledby="hero-c-heading" className="relative mx-auto max-w-7xl px-5 pb-24 pt-44 sm:px-8">
          <div className="flex items-end justify-between gap-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--accent)]">
              Intelligent Architecture Factory — a Citi product for US Consumer Cards
            </p>
            <div className="hidden items-center gap-4 md:flex" aria-hidden="true">
              <IAFMark className="h-5 w-auto" />
            </div>
          </div>
          <MaskedLines
            className="mt-14 font-display text-[13vw] font-semibold leading-[0.98] tracking-tight sm:text-[7.5rem]"
            accentIndex={1}
            lines={["The future of Cards", "architecture:"]}
          />
          <MaskedLines
            className="mt-2 font-display text-3xl font-medium leading-tight text-[var(--muted)] sm:text-5xl"
            lines={["intelligent. governed. always current."]}
          />
          <Reveal delay={0.8} className="mt-12 flex flex-wrap items-center gap-4">
            <a
              href="#film"
              data-testid="hero-watch-film-c"
              className="rounded-full bg-[var(--ink)] px-7 py-3.5 text-sm font-semibold text-[#070B14] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent)]"
            >
              Watch the v6 film
            </a>
            <a
              href="#graph"
              data-testid="hero-read-story-c"
              className="rounded-full border border-[var(--line-strong)] px-7 py-3.5 text-sm font-semibold text-[var(--ink)] transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)]"
            >
              Read the story
            </a>
          </Reveal>
        </section>

        {/* PANORAMIC FILM — spotlighted, massive negative space */}
        <section id="film" aria-labelledby="film-heading-c" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <Reveal>
            <h2 id="film-heading-c" className="sr-only">
              The v6 product film
            </h2>
            <motion.figure style={{ y: frameY }} className="relative">
              <div className="pointer-events-none absolute -inset-4 border border-[var(--line)]" aria-hidden="true" />
              <video
                data-testid="film-video-c"
                controls
                preload="none"
                poster="/assets/v6_title.jpg"
                aria-label="Intelligent Architecture Factory v6 product film"
                className="aspect-video w-full bg-black object-cover"
              >
                <source src="/assets/iaf-v6.mp4" type="video/mp4" />
                <track kind="captions" label="English captions" srcLang="en" src="/assets/v6-captions.vtt" default />
                Your browser does not support the video tag.
              </video>
              <figcaption className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                v6 — problem to operating model in five minutes · captions included
              </figcaption>
            </motion.figure>
          </Reveal>
        </section>

        <DomainsMarquee slow />

        {/* THE PROBLEM — editorial pull */}
        <section id="graph" aria-labelledby="problem-heading-c" className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
          <Reveal className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <Eyebrow>The problem</Eyebrow>
              <h2 id="problem-heading-c" className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                The knowledge was scattered.
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--muted)]">
                ARB decisions in one place. Standards in another. Static diagrams everywhere. Expert knowledge in
                people&apos;s heads. Every review started from scratch — and drift was found after deployment.
              </p>
            </div>
            <blockquote className="border-l-2 border-[var(--electric)] pl-8">
              <p className="font-display text-3xl font-medium leading-snug text-[var(--ink)] sm:text-4xl">
                “What if every architectural design took <span className="text-[var(--accent)]">hours, not days?</span>”
              </p>
              <footer className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                The question behind iAF
              </footer>
            </blockquote>
          </Reveal>
          <Reveal delay={0.15} className="mt-20">
            <figure className="border border-[var(--line-strong)]">
              <img
                src="/assets/v6_kg2.jpg"
                alt="One knowledge graph: ingestion sources fused into a single source of truth connecting the thirteen Cards domains"
                className="w-full"
              />
              <figcaption className="border-t border-[var(--line)] bg-[var(--surface)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                The answer — one knowledge graph, every Cards domain, always current
              </figcaption>
            </figure>
          </Reveal>
        </section>

        {/* TRANSFORMATION TABLE */}
        <section id="permits" aria-labelledby="impact-heading-c" className="border-y border-[var(--line)] bg-[var(--surface)]/40">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
            <Reveal>
              <Eyebrow>Permit to design · Permit to build</Eyebrow>
              <h2 id="impact-heading-c" className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                The new operating model.
              </h2>
            </Reveal>
            <Reveal delay={0.15} className="mt-12">
              <div className="overflow-hidden border border-[var(--line)]" data-testid="impact-table-c">
                <table className="w-full text-left">
                  <caption className="sr-only">Transformation impact: before and after iAF</caption>
                  <thead>
                    <tr className="border-b border-[var(--line)] bg-[var(--bg)]">
                      {["", "Today", "With iAF"].map((h, i) => (
                        <th key={i} scope="col" className="px-6 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TRANSFORMATION.map(([k, before, after]) => (
                      <tr key={k} className="border-b border-[var(--line)] last:border-0">
                        <th scope="row" className="px-6 py-5 font-display text-lg font-semibold text-[var(--ink)]">
                          {k}
                        </th>
                        <td className="px-6 py-5 text-sm text-[var(--muted)]">{before}</td>
                        <td className="px-6 py-5 text-sm font-medium text-[var(--accent)]">{after}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ASSISTANT — editorial two-column */}
        <section id="assistant" aria-labelledby="assistant-heading-c" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <Reveal>
              <Eyebrow>The Knowledge Assistant</Eyebrow>
              <h2 id="assistant-heading-c" className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                Ask the graph anything.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--muted)]">
                API coverage, risk posture, diagram status — conversational answers grounded in the knowledge graph,
                with sources cited. Hours of digging, now seconds.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <ChatCard testid="assistant-card-c" />
            </Reveal>
          </div>
        </section>

        {/* NAVIGATION */}
        <section id="navigation" aria-labelledby="nav-heading-c" className="border-t border-[var(--line)]">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
            <Reveal>
              <Eyebrow>Finding your way</Eyebrow>
              <h2 id="nav-heading-c" className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                Pick a domain. Open a capability. Read the truth.
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-10 lg:grid-cols-5">
              <Reveal className="lg:col-span-3">
                <figure className="border border-[var(--line-strong)]">
                  <img
                    src="/assets/product-api-catalog.jpg"
                    alt="iAF workspace: API catalog for a domain, showing types, gateways and producer systems"
                    className="w-full"
                    loading="lazy"
                  />
                </figure>
              </Reveal>
              <div className="lg:col-span-2">
                <ol className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
                  {[
                    ["01", "Domains sidebar", "Thirteen core Cards domains, always one click away."],
                    ["02", "Capability cards", "Diagrams, assessment, risk & compliance, API catalog."],
                    ["03", "Lifecycle tabs", "Every diagram tracked: draft, in review, approved, rejected."],
                    ["04", "Executive summary", "An LLM reads the domain and writes the brief for you."],
                  ].map(([n, t, d]) => (
                    <li key={n} className="flex gap-6 py-6">
                      <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--electric)]">{n}</span>
                      <div>
                        <p className="font-display text-lg font-semibold text-[var(--ink)]">{t}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">{d}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer variant="c" />
    </div>
  );
}
