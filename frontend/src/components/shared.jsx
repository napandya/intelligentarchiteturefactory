import { motion, useReducedMotion } from "framer-motion";
import { MessageSquare, ArrowRight, ShieldCheck, Layers, FileSearch, Boxes } from "lucide-react";

export const DOMAINS = [
  "Accounts Management & Servicing",
  "Agentic Commerce",
  "Collections & Recovery",
  "Credit Decisioning & Risk",
  "Customer Onboarding & Acquisition",
  "Data & Analytics",
  "Disputes & Fraud",
  "Marketing & Sales",
  "Merchant & Partner Services",
  "Miscellaneous",
  "Payments",
  "Product Management",
  "Rewards & Loyalty",
];

export const AGENTS = [
  "Architecture Knowledge",
  "Technology Risk (NFR)",
  "Architecture Diagrams",
  "Intake Governance",
  "Compliance & Controls",
];

export const CitiLogo = ({ className = "h-6 w-auto" }) => (
  <svg viewBox="0 0 64 32" className={className} role="img" aria-label="Citi">
    <path d="M14 13 Q 26 2 38 13" stroke="#E30917" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    <text
      x="32"
      y="28"
      textAnchor="middle"
      fontFamily="Interstate, 'IBM Plex Sans', sans-serif"
      fontWeight="600"
      fontSize="22"
      fill="#EEF3FF"
      letterSpacing="0.5"
    >
      citi
    </text>
  </svg>
);

export const IAFMark = ({ className = "h-7 w-auto" }) => (
  <svg viewBox="0 0 88 48" className={className} role="img" aria-label="iAF monogram">
    <rect x="4" y="6" width="6" height="6" fill="#4C93FF" />
    <line x1="7" y1="18" x2="7" y2="42" stroke="#EEF3FF" strokeWidth="5.5" strokeLinecap="square" />
    <polyline points="18,42 34,8 48,8" stroke="#EEF3FF" strokeWidth="5.5" strokeLinecap="square" fill="none" />
    <line x1="48" y1="8" x2="48" y2="42" stroke="#EEF3FF" strokeWidth="5.5" strokeLinecap="square" />
    <line x1="48" y1="8" x2="64" y2="8" stroke="#EEF3FF" strokeWidth="5.5" strokeLinecap="square" />
    <line x1="26" y1="26" x2="62" y2="26" stroke="#4C93FF" strokeWidth="5.5" strokeLinecap="square" />
  </svg>
);

export const Eyebrow = ({ children, className = "" }) => (
  <p className={`font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--accent)] flex items-center gap-2.5 ${className}`}>
    <span className="inline-block h-1.5 w-1.5 bg-[var(--electric)]" aria-hidden="true" />
    {children}
  </p>
);

export const MaskedLines = ({ lines, className = "", accentIndex = -1 }) => {
  const reduce = useReducedMotion();
  return (
    <h1 className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className={`block ${i === accentIndex ? "text-[var(--accent)]" : ""}`}
            initial={reduce ? false : { y: "112%" }}
            animate={reduce ? {} : { y: 0 }}
            transition={{ delay: 0.25 + i * 0.16, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </h1>
  );
};

export const Reveal = ({ children, delay = 0, className = "", y = 28 }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

export const Header = ({ variant = "a" }) => {
  const links = [
    { label: "Knowledge graph", href: "#graph" },
    { label: "Permits", href: "#permits" },
    { label: "Assistant", href: "#assistant" },
    { label: "Navigation", href: "#navigation" },
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--line)] bg-[#070B14]/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5 sm:px-8">
        <a href="#top" aria-label="Citi — back to top" data-testid={`header-citi-logo-${variant}`}>
          <CitiLogo />
        </a>
        <span className="h-6 w-px bg-[var(--line-strong)]" aria-hidden="true" />
        <a href="#top" className="flex items-center gap-2.5" aria-label="iAF — back to top" data-testid={`header-iaf-logo-${variant}`}>
          <IAFMark />
          <span className="hidden text-[13px] font-medium tracking-wide text-[var(--ink)] md:block">
            Intelligent Architecture Factory
          </span>
        </a>
        <nav className="ml-auto hidden items-center gap-7 lg:flex" aria-label="Primary">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-testid={`nav-${l.label.toLowerCase().replace(/\s+/g, "-")}-${variant}`}
              className="text-[13px] text-[var(--muted)] transition-colors duration-200 hover:text-[var(--ink)]"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href="#film"
          data-testid={`header-film-cta-${variant}`}
          className="ml-auto rounded-full bg-[var(--electric)] px-5 py-2 text-[13px] font-semibold text-[#070B14] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent)] lg:ml-6"
        >
          Watch the film
        </a>
      </div>
    </header>
  );
};

export const DomainsMarquee = ({ slow = false }) => (
  <section aria-label="The thirteen Cards domains" className="overflow-hidden border-y border-[var(--line)] py-7">
    <div className={`flex w-max gap-14 ${slow ? "animate-marquee-slow" : "animate-marquee"}`}>
      {[0, 1].map((copy) => (
        <div key={copy} className="flex shrink-0 items-center gap-14" aria-hidden={copy === 1}>
          {DOMAINS.map((d, i) => (
            <span key={d} className="flex items-center gap-14 whitespace-nowrap">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-lg font-medium text-[var(--ink)]/85">{d}</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  </section>
);

export const StatsStrip = () => {
  const stats = [
    { value: "13", label: "core Cards domains" },
    { value: "1", label: "living knowledge graph" },
    { value: "5", label: "specialized AI agents" },
    { value: "577", label: "APIs catalogued" },
    { value: "80%", label: "cycle-time cut" },
  ];
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] sm:grid-cols-5" data-testid="stats-strip">
      {stats.map((s) => (
        <div key={s.label} className="bg-[var(--surface)] px-6 py-7">
          <dt className="order-2 mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">{s.label}</dt>
          <dd className="font-display text-4xl font-semibold text-[var(--ink)]">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export const PermitFlow = ({ testid = "permit-flow" }) => {
  const todaySteps = ["PTS raised", "Permit to Design", "Self-assessment", "Architect approves", "Or escalates to ARB"];
  const iafSteps = ["Design", "Build", "Deploy"];
  return (
    <div className="grid gap-6 lg:grid-cols-2" data-testid={testid}>
      <div className="border border-[var(--line)] bg-[var(--surface)] p-7">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Today&apos;s process</p>
        <ol className="mt-6 space-y-4">
          {todaySteps.map((s, i) => (
            <li key={s} className="flex items-center gap-4">
              <span className="font-mono text-[11px] text-[var(--muted)]">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1 border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--muted)]">{s}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 font-display text-2xl font-semibold text-[var(--ink)]">
          30–32 hours <span className="text-base font-normal text-[var(--muted)]">per permit, all manual</span>
        </p>
      </div>
      <div className="relative border border-[var(--electric)]/40 bg-[var(--surface-2)] p-7">
        <div className="absolute -top-px left-7 h-0.5 w-16 bg-[var(--electric)]" aria-hidden="true" />
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent)]">The same journey, with iAF</p>
        <ol className="mt-6 space-y-4">
          {iafSteps.map((s, i) => (
            <li key={s} className="flex items-center gap-4">
              <span className="font-mono text-[11px] text-[var(--accent)]">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1 border border-[var(--electric)]/25 bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--ink)]">
                {s}
                <span className="float-right text-[var(--accent)]" aria-hidden="true">
                  <ShieldCheck size={15} strokeWidth={2} />
                </span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-6 font-display text-2xl font-semibold text-[var(--ink)]">
          6–8 hours <span className="text-base font-normal text-[var(--muted)]">governed end-to-end, automated</span>
        </p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
          5 AI agents · impacted systems found · NFRs drafted · controls verified
        </p>
      </div>
    </div>
  );
};

export const ChatCard = ({ testid = "assistant-card" }) => (
  <div className="flex h-full flex-col border border-[var(--line)] bg-[var(--surface)]" data-testid={testid}>
    <div className="flex items-center gap-3 border-b border-[var(--line)] px-6 py-4">
      <span className="grid h-8 w-8 place-items-center bg-[var(--tile)] text-white">
        <MessageSquare size={15} aria-hidden="true" />
      </span>
      <div>
        <p className="font-display text-sm font-semibold text-[var(--ink)]">Knowledge Assistant</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">Chat with the graph</p>
      </div>
    </div>
    <div className="flex flex-1 flex-col gap-4 px-6 py-6">
      <div className="max-w-[85%] self-end rounded-2xl rounded-tr-sm bg-[var(--electric)]/15 border border-[var(--electric)]/30 px-4 py-3 text-sm text-[var(--ink)]">
        Show me the API catalog coverage for Credit Decisioning &amp; Risk
      </div>
      <div className="max-w-[92%] rounded-2xl rounded-tl-sm border border-[var(--line)] bg-[var(--bg)] px-4 py-4">
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          The API catalog coverage for <span className="text-[var(--ink)]">Credit Decisioning &amp; Risk</span> is largely on
          non-APIGEE gateways. Key metrics below.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            ["62", "API records"],
            ["3", "sub-domains"],
            ["29", "producer systems"],
          ].map(([v, l]) => (
            <div key={l} className="border border-[var(--line)] px-3 py-2.5">
              <p className="font-display text-xl font-semibold text-[var(--accent)]">{v}</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted)]">{l}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--electric)]">
          Answered in seconds · sources cited
        </p>
      </div>
    </div>
    <div className="px-6 pb-6">
      <label htmlFor={`${testid}-input`} className="sr-only">
        Ask the Knowledge Assistant a question
      </label>
      <div className="flex items-center gap-2 border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
        <input
          id={`${testid}-input`}
          data-testid={`${testid}-input`}
          type="text"
          placeholder="Ask about a domain, API, or risk…"
          className="w-full bg-transparent text-sm text-[var(--ink)] placeholder:text-[var(--muted)]/60 focus:outline-none"
        />
        <button
          type="button"
          data-testid={`${testid}-send`}
          aria-label="Send question"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--electric)] text-[#070B14] transition-[background-color,transform] duration-200 hover:bg-[var(--accent)]"
        >
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
);

const CAPABILITIES = [
  {
    icon: Boxes,
    title: "Architecture Diagrams",
    stat: "15 diagrams · 3 approved views",
    desc: "Living, versioned architecture-as-code — generated and edited in natural language, never static pictures.",
  },
  {
    icon: Layers,
    title: "Architecture Assessment",
    stat: "ARB review · 6 approved versions",
    desc: "Every design scored against standards and past ARB decisions before a human ever reviews it.",
  },
  {
    icon: ShieldCheck,
    title: "Risk & Compliance",
    stat: "NFRs · Controls",
    desc: "Non-functional requirements drafted and controls verified pre-deploy. Drift stopped before production.",
  },
  {
    icon: FileSearch,
    title: "API Catalog",
    stat: "577 APIs · 121 producers",
    desc: "Every endpoint catalogued, typed and traced back to the system that produces it.",
  },
];

export const CapabilitiesGrid = ({ testid = "capabilities-grid" }) => (
  <div className="grid gap-4 sm:grid-cols-2" data-testid={testid}>
    {CAPABILITIES.map((c, i) => (
      <Reveal key={c.title} delay={i * 0.08}>
        <div className="group h-full border border-[var(--line)] bg-[var(--surface)] p-7 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-[var(--electric)]/50">
          <span className="grid h-10 w-10 place-items-center border border-[var(--electric)]/30 bg-[var(--electric)]/10 text-[var(--accent)]">
            <c.icon size={17} aria-hidden="true" />
          </span>
          <h3 className="mt-5 font-display text-xl font-semibold text-[var(--ink)]">{c.title}</h3>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--electric)]">{c.stat}</p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{c.desc}</p>
        </div>
      </Reveal>
    ))}
  </div>
);

export const FilmSection = ({ variant = "a", framed = false }) => (
  <section id="film" aria-labelledby={`film-heading-${variant}`} className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
    <Reveal>
      <Eyebrow>The product film</Eyebrow>
      <h2 id={`film-heading-${variant}`} className="mt-4 max-w-2xl font-display text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
        See v6 end to end.
      </h2>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)]">
        Five minutes, problem to operating model — the knowledge graph, the assistant, and a permit journey that runs in
        hours. Captions included.
      </p>
    </Reveal>
    <Reveal delay={0.15}>
      <div className={`relative mt-12 ${framed ? "border border-[var(--line-strong)]" : ""}`}>
        {!framed && (
          <div className="pointer-events-none absolute -inset-3 border border-[var(--navy)]" aria-hidden="true" />
        )}
        {framed && (
          <div className="flex items-center justify-between border-b border-[var(--line-strong)] bg-[var(--surface)] px-5 py-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">IAF_V6.MP4</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--electric)]">RUN 05:17</p>
          </div>
        )}
        <video
          data-testid={`film-video-${variant}`}
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
      </div>
    </Reveal>
  </section>
);

export const Footer = ({ variant = "a" }) => (
  <footer className="border-t border-[var(--line)]" data-testid={`footer-${variant}`}>
    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-4">
            <CitiLogo className="h-6 w-auto" />
            <span className="h-6 w-px bg-[var(--line-strong)]" aria-hidden="true" />
            <IAFMark className="h-6 w-auto" />
          </div>
          <p className="mt-5 text-sm leading-relaxed text-[var(--muted)]">
            Intelligent Architecture Factory. Built for US Consumer Cards. Internal product — Citi employees only.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-16 gap-y-3 text-sm">
          {[
            ["Knowledge graph", "#graph"],
            ["Permits", "#permits"],
            ["Assistant", "#assistant"],
            ["Navigation", "#navigation"],
          ].map(([label, href]) => (
            <a key={href} href={href} className="text-[var(--muted)] transition-colors hover:text-[var(--ink)]">
              {label}
            </a>
          ))}
        </nav>
        <div className="max-w-xs text-sm text-[var(--muted)]" id="accessibility">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">Accessibility</p>
          <p className="mt-3 leading-relaxed">
            This page targets WCAG 2.2 AA and ADA: AA-contrast palette, keyboard-focus rings, captions on all video,
            semantic landmarks, and reduced-motion support.
          </p>
        </div>
      </div>
      <p className="mt-16 border-t border-[var(--line)] pt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]/70">
        © 2026 Citigroup Inc. Citi and Arc Design is a registered service mark. iAF identity v0.1 — Ligature direction.
      </p>
    </div>
  </footer>
);
