import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useReducedMotion, motion } from "framer-motion";
import {
  Layers, ShieldCheck, FileSearch, Boxes, MessageSquare, Send, ChevronRight,
  LayoutGrid, Wallet, ShoppingCart, Landmark, CreditCard, UserPlus, BarChart3,
  AlertTriangle, Megaphone, Store, Package, Gift, FileText, Monitor, Search, ArrowLeft, X,
} from "lucide-react";
import { CitiLogo, IAFMark, PermitFlow } from "../components/shared";

const DOMAINS = [
  { name: "Accounts Management & Servicing", icon: Wallet, caps: ["Account Tokenization", "Merchant or Account Profile", "Product & Account Services"] },
  { name: "Agentic Commerce", icon: ShoppingCart, caps: ["Delegated Checkout", "Agent Identity"] },
  { name: "Collections & Recovery", icon: Landmark, caps: ["Early-Stage Collections", "Recovery & Charge-off"] },
  { name: "Credit Decisioning & Risk", icon: CreditCard, caps: ["Credit Decisioning", "Credit Bureau Integration"] },
  { name: "Customer Onboarding & Acquisition", icon: UserPlus, caps: ["Application Intake", "KYC & Identity"] },
  { name: "Data & Analytics", icon: BarChart3, caps: ["Reporting", "Feature Store"] },
  { name: "Disputes & Fraud", icon: AlertTriangle, caps: ["Dispute Intake", "Fraud Detection"] },
  { name: "Marketing & Sales", icon: Megaphone, caps: ["Campaign Management", "Offers"] },
  { name: "Merchant & Partner Services", icon: Store, caps: ["Partner Onboarding", "Settlement"] },
  { name: "Miscellaneous", icon: Package, caps: ["Shared Utilities"] },
  { name: "Payments", icon: CreditCard, caps: ["Payment Posting", "Autopay"] },
  { name: "Product Management", icon: Layers, caps: ["Product Catalog", "Pricing"] },
  { name: "Rewards & Loyalty", icon: Gift, caps: ["Points Accrual", "Redemption"] },
];

const DIAGRAMS = [
  { name: "Branded Cards–Account Maintenance", v: "v3", status: "DRAFT", sub: "Product & Account Services", editor: "HG48153", reviewed: "—", updated: "4 days ago" },
  { name: "Branded Cards–Balcon", v: "v4", status: "REJECTED", sub: "Product & Account Services", editor: "HG48153", reviewed: "HG48153", updated: "4 days ago" },
  { name: "Branded Cards–CyberSource Tokenization Vendor", v: "v1", status: "DRAFT", sub: "Account Tokenization", editor: "sm10007", reviewed: "—", updated: "18 days ago" },
  { name: "Branded Cards–FlexPay", v: "v1", status: "DRAFT", sub: "Product & Account Services", editor: "sm10007", reviewed: "—", updated: "18 days ago" },
  { name: "Card Issuance", v: "v2", status: "DRAFT", sub: "Product & Account Services", editor: "sm10007", reviewed: "—", updated: "18 days ago" },
  { name: "CRS–Account Look Up", v: "v8", status: "DRAFT", sub: "Product & Account Services", editor: "sm10007", reviewed: "—", updated: "11 days ago" },
  { name: "CRS–Account Maintenance", v: "v1", status: "IN REVIEW", sub: "Product & Account Services", editor: "sm10007", reviewed: "—", updated: "18 days ago" },
  { name: "CRS–Merchant Servicing", v: "v1", status: "DRAFT", sub: "Merchant or Account Profile", editor: "sm10007", reviewed: "—", updated: "18 days ago" },
];

const STATUS_STYLES = {
  DRAFT: "bg-[var(--muted)]/15 text-[var(--muted)] border-[var(--line)]",
  "IN REVIEW": "bg-[#F2A93B]/15 text-[#F2C14E] border-[#F2A93B]/30",
  APPROVED: "bg-[#3FB97F]/15 text-[#5ED39A] border-[#3FB97F]/30",
  REJECTED: "bg-[#E5484D]/15 text-[#F0707B] border-[#E5484D]/30",
};

const CAP_CARDS = [
  { icon: Boxes, title: "Architecture Diagrams", stat: "15 diagrams", sub: "3 approved architecture views" },
  { icon: Layers, title: "Architecture Assessment", stat: "2 in ARB review", sub: "6 approved versions" },
  { icon: ShieldCheck, title: "Risk & Compliance", stat: "—", sub: "Not available" },
  { icon: FileSearch, title: "API Catalog", stat: "577 APIs", sub: "0% documented" },
];

export default function Workspace() {
  const [params] = useSearchParams();
  const [assistantOpen, setAssistantOpen] = useState(params.get("open") === "assistant");
  const [activeDomain, setActiveDomain] = useState(0);
  const [tab, setTab] = useState("All");
  const reduce = useReducedMotion();
  const domain = DOMAINS[activeDomain];

  const counts = useMemo(() => {
    const c = { All: DIAGRAMS.length };
    ["DRAFT", "IN REVIEW", "APPROVED", "REJECTED"].forEach((s) => {
      c[s] = DIAGRAMS.filter((d) => d.status === s).length;
    });
    return c;
  }, []);

  const filtered = tab === "All" ? DIAGRAMS : DIAGRAMS.filter((d) => d.status === tab);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      {/* APP TOP BAR */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[#070B14]/85 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <IAFMark className="h-5 w-auto" />
            <span className="hidden text-[13px] font-medium md:block">Intelligent Architecture Factory</span>
          </div>
          <div className="mx-auto hidden w-full max-w-md items-center gap-2 border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 md:flex">
            <Search size={14} className="text-[var(--muted)]" aria-hidden="true" />
            <label htmlFor="global-search" className="sr-only">Search domains and sub-domains</label>
            <input
              id="global-search"
              data-testid="workspace-search"
              type="text"
              placeholder="Search domains and sub-domains…"
              className="w-full bg-transparent text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)]/60 focus:outline-none"
            />
          </div>
          <Link
            to="/"
            data-testid="workspace-back-link"
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--line-strong)] px-4 py-1.5 text-[12px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--accent)] md:ml-0"
          >
            <ArrowLeft size={13} aria-hidden="true" /> Landing
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 gap-6 px-4 py-6 sm:px-6">
        {/* DOMAINS SIDEBAR */}
        <nav aria-label="Cards domains" className="hidden w-64 shrink-0 lg:block" data-testid="domains-sidebar">
          <div className="sticky top-20">
            <p className="px-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">Cards domains</p>
            <ul className="mt-3 space-y-0.5">
              {DOMAINS.map((d, i) => (
                <li key={d.name}>
                  <button
                    type="button"
                    onClick={() => setActiveDomain(i)}
                    data-testid={`domain-${d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    aria-current={i === activeDomain ? "true" : undefined}
                    className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-[13px] transition-colors duration-150 ${
                      i === activeDomain
                        ? "bg-[var(--electric)]/15 font-medium text-[var(--ink)]"
                        : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
                    }`}
                  >
                    <d.icon size={14} className={i === activeDomain ? "text-[var(--accent)]" : "text-[var(--muted)]/70"} aria-hidden="true" />
                    <span className="flex-1 truncate">{d.name}</span>
                    {i === activeDomain && <ChevronRight size={13} className="text-[var(--accent)]" aria-hidden="true" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* MOBILE DOMAIN SELECT */}
        <div className="w-full lg:hidden">
          <label htmlFor="mobile-domain" className="sr-only">Choose a Cards domain</label>
          <select
            id="mobile-domain"
            data-testid="mobile-domain-select"
            value={activeDomain}
            onChange={(e) => setActiveDomain(Number(e.target.value))}
            className="w-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--ink)]"
          >
            {DOMAINS.map((d, i) => (
              <option key={d.name} value={i}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* MAIN */}
        <main id="main" className="min-w-0 flex-1" data-testid="workspace-main">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
            {domain.caps.length} capabilities · {DIAGRAMS.length} diagrams
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">{domain.name}</h1>

          {/* CAPABILITY CARDS */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" data-testid="capability-cards">
            {CAP_CARDS.map((c) => (
              <div key={c.title} className="border border-[var(--line)] bg-[var(--surface)] p-5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--electric)]/50">
                <span className="grid h-9 w-9 place-items-center border border-[var(--electric)]/30 bg-[var(--electric)]/10 text-[var(--accent)]">
                  <c.icon size={15} aria-hidden="true" />
                </span>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">{c.title}</p>
                <p className="mt-1 font-display text-lg font-semibold text-[var(--ink)]">{c.stat}</p>
                <p className="text-[12px] text-[var(--muted)]">{c.sub}</p>
              </div>
            ))}
          </div>

          {/* LIFECYCLE TABS */}
          <div className="mt-8 flex flex-wrap items-center gap-2" role="tablist" aria-label="Diagram lifecycle" data-testid="lifecycle-tabs">
            {["All", "DRAFT", "IN REVIEW", "APPROVED", "REJECTED"].map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                data-testid={`tab-${t.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setTab(t)}
                className={`rounded-full border px-4 py-1.5 text-[12px] font-medium transition-colors duration-150 ${
                  tab === t
                    ? "border-[var(--electric)] bg-[var(--electric)]/15 text-[var(--ink)]"
                    : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
                }`}
              >
                {t === "All" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}{" "}
                <span className="font-mono text-[10px] opacity-70">{counts[t] ?? counts.All}</span>
              </button>
            ))}
          </div>

          {/* DIAGRAM TABLE */}
          <div className="mt-4 overflow-x-auto border border-[var(--line)]" data-testid="diagram-table">
            <table className="w-full min-w-[760px] text-left">
              <caption className="sr-only">Architecture diagrams for {domain.name}</caption>
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--surface)]">
                  {["Name", "Status", "Sub-domain", "Edited by", "Reviewed by", "Updated"].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.name} className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--surface)]/60">
                    <td className="px-4 py-3.5 text-[13px] font-medium text-[var(--ink)]">
                      {d.name} <span className="font-mono text-[11px] text-[var(--muted)]">{d.v}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${STATUS_STYLES[d.status]}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">{d.sub}</td>
                    <td className="px-4 py-3.5 text-[12px] text-[var(--muted)]">{d.editor}</td>
                    <td className="px-4 py-3.5 text-[12px] text-[var(--muted)]">{d.reviewed}</td>
                    <td className="px-4 py-3.5 text-[12px] text-[var(--muted)]">{d.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PERMIT FLOW — opened from the landing card */}
          <section id="permits" aria-labelledby="permits-heading" className="mt-16">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--accent)]">Permit to design · Permit to build</p>
            <h2 id="permits-heading" className="mt-3 font-display text-3xl font-semibold tracking-tight">
              Same rigor. Without the drag.
            </h2>
            <div className="mt-8">
              <PermitFlow testid="permit-flow-app" />
            </div>
          </section>
        </main>
      </div>

      {/* KNOWLEDGE ASSISTANT FAB */}
      {!assistantOpen && (
        <button
          type="button"
          onClick={() => setAssistantOpen(true)}
          data-testid="assistant-open-button"
          aria-label="Open the Knowledge Assistant"
          className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[var(--electric)] text-[#070B14] shadow-lg shadow-[var(--electric)]/25 transition-[background-color,transform] duration-200 hover:-translate-y-1 hover:bg-[var(--accent)]"
        >
          <MessageSquare size={20} aria-hidden="true" />
        </button>
      )}

      {/* ASSISTANT PANEL */}
      {assistantOpen && (
        <motion.aside
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Knowledge Assistant"
          className="fixed bottom-6 right-6 z-40 flex h-[480px] w-[min(92vw,380px)] flex-col border border-[var(--line-strong)] bg-[var(--surface)] shadow-2xl"
          data-testid="assistant-panel"
        >
          <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3">
            <span className="grid h-8 w-8 place-items-center bg-[var(--tile)] text-white">
              <MessageSquare size={14} aria-hidden="true" />
            </span>
            <div className="flex-1">
              <p className="text-[13px] font-semibold">Knowledge Assistant</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted)]">Chat with the graph</p>
            </div>
            <button
              type="button"
              onClick={() => setAssistantOpen(false)}
              aria-label="Close the Knowledge Assistant"
              data-testid="assistant-close-button"
              className="grid h-8 w-8 place-items-center text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
            <div className="max-w-[85%] self-end rounded-2xl rounded-tr-sm border border-[var(--electric)]/30 bg-[var(--electric)]/15 px-3.5 py-2.5 text-[13px]">
              Show me the API catalog coverage for {domain.name}
            </div>
            <div className="max-w-[95%] rounded-2xl rounded-tl-sm border border-[var(--line)] bg-[var(--bg)] px-3.5 py-3">
              <p className="text-[13px] leading-relaxed text-[var(--muted)]">
                The API catalog coverage for <span className="text-[var(--ink)]">{domain.name}</span> is largely on
                non-APIGEE gateways. Key metrics below.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[["62", "API records"], ["3", "sub-domains"], ["29", "producers"]].map(([v, l]) => (
                  <div key={l} className="border border-[var(--line)] px-2.5 py-2">
                    <p className="font-display text-lg font-semibold text-[var(--accent)]">{v}</p>
                    <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--muted)]">{l}</p>
                  </div>
                ))}
              </div>
              <p className="mt-2.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--electric)]">
                Answered in seconds · sources cited
              </p>
            </div>
          </div>
          <div className="border-t border-[var(--line)] px-4 py-3">
            <label htmlFor="assistant-input" className="sr-only">Ask the Knowledge Assistant a question</label>
            <div className="flex items-center gap-2 border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5">
              <input
                id="assistant-input"
                data-testid="assistant-input"
                type="text"
                placeholder="Ask about a domain, API, or risk…"
                className="w-full bg-transparent text-[13px] placeholder:text-[var(--muted)]/60 focus:outline-none"
              />
              <button
                type="button"
                aria-label="Send question"
                data-testid="assistant-send-button"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--electric)] text-[#070B14] transition-colors hover:bg-[var(--accent)]"
              >
                <Send size={13} aria-hidden="true" />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </div>
  );
}
