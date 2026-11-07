import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { Play, Pause, MessageSquare, ShieldCheck, Layers, ArrowUpRight, ChevronRight } from "lucide-react";
import { CitiLogo, IAFMark, MaskedLines, Reveal, DomainsMarquee, FilmSection, Footer } from "../components/shared";

const CARDS = [
  {
    to: "/app?open=assistant",
    icon: MessageSquare,
    kicker: "01 · Knowledge Assistant",
    title: "Chat with the knowledge graph",
    desc: "Ask about any domain, API, or risk. Answers grounded in the graph — hours of digging, now seconds.",
    testid: "landing-card-assistant",
  },
  {
    to: "/permits",
    icon: ShieldCheck,
    kicker: "02 · Permit journey",
    title: "Permit to Design · Permit to Build",
    desc: "The same rigor, without the drag. 30–32 hours per permit, now a governed 6–8 hour run.",
    testid: "landing-card-permits",
  },
  {
    to: "/app",
    icon: Layers,
    kicker: "03 · Cards domains",
    title: "13 domains, one workspace",
    desc: "Pick a domain, open a capability, drill into diagrams — every version tracked from draft to approved.",
    testid: "landing-card-domains",
  },
];

export default function Landing() {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce && videoRef.current) {
      videoRef.current.pause();
      setPaused(true);
    }
  }, [reduce]);

  const toggleVideo = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

  return (
    <div className="bg-[var(--bg)] text-[var(--ink)]">
      {/* HERO — scene one of the v6 film as the backdrop */}
      <section id="main" aria-labelledby="hero-heading" className="relative flex min-h-screen flex-col overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay={!reduce}
          muted
          loop
          playsInline
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src="/assets/scene-one-loop.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#070B14]/80" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/30 to-[#070B14]/60" aria-hidden="true" />

        <header className="relative z-10 border-b border-white/10">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5 sm:px-8">
            <a href="/" aria-label="Citi" data-testid="landing-citi-logo">
              <CitiLogo />
            </a>
            <span className="h-6 w-px bg-white/20" aria-hidden="true" />
            <div className="flex items-center gap-2.5">
              <IAFMark />
              <span className="hidden text-[13px] font-medium tracking-wide md:block">
                Intelligent Architecture Factory
              </span>
            </div>
            <a
              href="#enter"
              data-testid="landing-enter-link"
              className="ml-auto rounded-full bg-[var(--electric)] px-5 py-2 text-[13px] font-semibold text-[#070B14] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent)]"
            >
              Enter iAF
            </a>
          </div>
        </header>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 py-16 sm:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--accent)]" data-testid="hero-eyebrow">
            Intelligent Architecture Factory · US Consumer Cards
          </p>
          <Link
            to="/start"
            data-testid="landing-enter-iaf"
            className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--electric)] px-8 py-4 text-sm font-semibold text-[#070B14] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent)]"
          >
            Enter iAF <ChevronRight size={16} aria-hidden="true" />
          </Link>
          <MaskedLines
            className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl"
            accentIndex={1}
            lines={["What if every design", "took hours, not days?"]}
          />
          <Reveal delay={0.7} className="mt-7 max-w-xl">
            <p className="text-lg leading-relaxed text-[var(--muted)]">
              One knowledge graph connecting all thirteen Cards domains — and five AI agents that run your permits on
              it. Choose where to start.
            </p>
          </Reveal>

          {/* THE THREE CARDS */}
          <div id="enter" className="mt-12 grid gap-4 lg:grid-cols-3" data-testid="landing-cards">
            {CARDS.map((c, i) => (
              <Reveal key={c.to + c.kicker} delay={0.35 + i * 0.12}>
                <Link
                  to={c.to}
                  data-testid={c.testid}
                  className="group flex h-full flex-col border border-white/15 bg-[#0B1220]/70 p-7 backdrop-blur-md transition-[border-color,transform,background-color] duration-300 hover:-translate-y-1.5 hover:border-[var(--electric)]/70 hover:bg-[#0B1220]/90"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center border border-[var(--electric)]/40 bg-[var(--electric)]/15 text-[var(--accent)]">
                      <c.icon size={17} aria-hidden="true" />
                    </span>
                    <ArrowUpRight
                      size={18}
                      className="text-[var(--muted)] transition-[transform,color] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--electric)]">{c.kicker}</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--ink)]">{c.title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted)]">{c.desc}</p>
                  <span className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">
                    Open in iAF →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 pb-6 sm:px-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]/80">
            Scene 01 — v6 film playing in the background
          </p>
          <button
            type="button"
            onClick={toggleVideo}
            data-testid="hero-video-toggle"
            aria-label={paused ? "Play background video" : "Pause background video"}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-[var(--ink)] transition-colors duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
          </button>
        </div>
      </section>

      <DomainsMarquee />

      {/* SIMPLE EXPLANATION */}
      <section aria-labelledby="how-heading" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--accent)]">The product, simply</p>
          <h2 id="how-heading" className="mt-4 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Three moves. One source of truth.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {[
            {
              n: "01",
              t: "Ask the graph",
              d: "The Knowledge Assistant reads the graph for you — API coverage, risk posture, diagram status — and answers in seconds, sources cited.",
              icon: MessageSquare,
            },
            {
              n: "02",
              t: "Run the permit",
              d: "Permit to Design, Permit to Build. Five AI agents find impacted systems, draft NFRs and verify controls — 6–8 hours, governed end-to-end.",
              icon: ShieldCheck,
            },
            {
              n: "03",
              t: "Navigate the domains",
              d: "Thirteen Cards domains in the sidebar, capability cards on the canvas, and every diagram tracked from draft to ARB-approved.",
              icon: Layers,
            },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="border-t-2 border-[var(--electric)]/60 pt-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--electric)]">{s.n}</span>
                  <s.icon size={18} className="text-[var(--accent)]" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold text-[var(--ink)]">{s.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2} className="mt-14">
          <Link
            to="/app"
            data-testid="landing-enter-workspace"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--electric)] px-7 py-3.5 text-sm font-semibold text-[#070B14] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent)]"
          >
            Open the workspace <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </Reveal>
      </section>

      <FilmSection variant="landing" />
      <Footer variant="landing" />
    </div>
  );
}
