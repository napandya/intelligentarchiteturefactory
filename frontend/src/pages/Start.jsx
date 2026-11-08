import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  MessageSquare, ShieldCheck, Layers, Send, X, ChevronRight,
  Boxes, FileSearch, Sparkles, Search, Network,
} from "lucide-react";
import AppShell, { NAV_ITEMS } from "../components/AppShell";
import { FileUpload, FileChip } from "../components/FileUpload";

const API = process.env.REACT_APP_BACKEND_URL;

/* ---------- Knowledge graph context for the assistant ---------- */
const DOMAINS = [
  { name: "Accounts Management & Servicing", caps: ["Account Tokenization", "Merchant or Account Profile", "Product & Account Services"], diagrams: 15, apis: 577, arb: 2 },
  { name: "Agentic Commerce", caps: ["Delegated Checkout", "Agent Identity"], diagrams: 6, apis: 84, arb: 1 },
  { name: "Collections & Recovery", caps: ["Early-Stage Collections", "Recovery & Charge-off"], diagrams: 9, apis: 143, arb: 0 },
  { name: "Credit Decisioning & Risk", caps: ["Credit Decisioning", "Credit Bureau Integration"], diagrams: 12, apis: 62, arb: 3 },
  { name: "Customer Onboarding & Acquisition", caps: ["Application Intake", "KYC & Identity"], diagrams: 11, apis: 138, arb: 1 },
  { name: "Data & Analytics", caps: ["Reporting", "Feature Store"], diagrams: 7, apis: 96, arb: 0 },
  { name: "Disputes & Fraud", caps: ["Dispute Intake", "Fraud Detection"], diagrams: 10, apis: 121, arb: 2 },
  { name: "Marketing & Sales", caps: ["Campaign Management", "Offers"], diagrams: 8, apis: 77, arb: 0 },
  { name: "Merchant & Partner Services", caps: ["Partner Onboarding", "Settlement"], diagrams: 9, apis: 105, arb: 1 },
  { name: "Miscellaneous", caps: ["Shared Utilities"], diagrams: 3, apis: 41, arb: 0 },
  { name: "Payments", caps: ["Payment Posting", "Autopay"], diagrams: 13, apis: 212, arb: 2 },
  { name: "Product Management", caps: ["Product Catalog", "Pricing"], diagrams: 5, apis: 58, arb: 0 },
  { name: "Rewards & Loyalty", caps: ["Points Accrual", "Redemption"], diagrams: 7, apis: 90, arb: 1 },
];

const STATUS_STYLES = {
  DRAFT: "border-[#4C93FF]/40 bg-[#4C93FF]/10 text-[#8FD0FF]",
  "IN REVIEW": "border-[#F2A93B]/40 bg-[#F2A93B]/10 text-[#F2C14E]",
  APPROVED: "border-[#3FB97F]/40 bg-[#3FB97F]/10 text-[#5ED39A]",
  REJECTED: "border-[#E5484D]/40 bg-[#E5484D]/10 text-[#F0707B]",
};

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

const FIRST = ["Maya", "Arjun", "Sofia", "Daniel", "Priya", "Marcus", "Elena", "Ravi", "Hannah", "Tom", "Nadia", "Chris"];
const LAST = ["Ramana", "Shah", "Garcia", "Kim", "Patel", "Weber", "Santos", "Iyer", "Lindgren", "Osei", "Khan", "Brooks"];
const PROJECTS = Array.from({ length: 36 }, (_, i) => {
  const r = (n) => (i * 7 + n * 13) % 17;
  const status = r(1) % 9 === 0 ? "NOT CREATED" : r(2) % 6 === 0 ? "IN REVIEW" : r(3) % 11 === 0 ? "APPROVED" : "DRAFT";
  return {
    id: `WR2024${String(4049 - i * 61).padStart(6, "0")}`,
    pts: `2025${String(108204 - i * 764).padStart(7, "0")}`,
    lob: `USCC Technology [L${(i % 4) + 5}]`,
    status,
    owner: `${FIRST[i % FIRST.length]} ${LAST[(i * 3 + 1) % LAST.length]}`,
  };
});
const PROJECT_STATUS_STYLES = { ...STATUS_STYLES, "NOT CREATED": "border-[var(--line)] bg-transparent text-[var(--muted)]" };

/* ---------- Chat hook (real backend, graceful fallback) ---------- */
function useAssistant(domainContext) {
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text, fileIds = []) => {
    const t = text.trim();
    if (!t || busy) return;
    setMessages((m) => [...m, { role: "user", text: t }]);
    setBusy(true);
    try {
      const res = await fetch(`${API}/api/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        credentials: "include",
        body: JSON.stringify({ message: t, domain_context: domainContext || null, file_ids: fileIds }),
      });
      if (!res.ok) throw new Error();
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("text/event-stream") && res.body) {
        // SSE streaming: append deltas, finish on `done`
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let acc = "";
        setMessages((m) => [...m, { role: "assistant", text: "", sources: [] }]);
        const patch = (fn) =>
          setMessages((m) => m.map((msg, i) => (i === m.length - 1 ? fn(msg) : msg)));
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() || "";
          for (const chunk of events) {
            const eventName = chunk.match(/^event: (.+)$/m)?.[1];
            const dataLine = chunk.match(/^data: (.+)$/m)?.[1];
            if (!dataLine) continue;
            try {
              const payload = JSON.parse(dataLine);
              if (eventName === "delta") {
                acc += payload.content || "";
                const text2 = acc;
                patch((msg) => ({ ...msg, text: text2 }));
              } else if (eventName === "done") {
                patch((msg) => ({ ...msg, text: payload.reply || acc, sources: payload.sources || [] }));
              } else if (eventName === "error") {
                throw new Error(payload.detail);
              }
            } catch (e) {
              if (eventName === "error") throw e;
            }
          }
        }
      } else {
        const data = await res.json();
        setMessages((m) => [...m, { role: "assistant", text: data.reply, sources: data.sources || [] }]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "The assistant service is being connected. Meanwhile, try asking about a domain's API coverage, diagram status, or what context belongs in a Permit-to-Design — those answers will come straight from the knowledge graph once the agent is live.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };
  return { messages, busy, send, endRef };
}

const SUGGESTIONS = [
  "Show API catalog coverage for Credit Decisioning & Risk",
  "What context goes into a Permit-to-Design?",
  "Which diagrams are in ARB review right now?",
];

function ChatPanel({ domainContext, full = false, testid = "assistant-panel" }) {
  const { messages, busy, send, endRef } = useAssistant(domainContext);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState([]);
  return (
    <div className={`flex h-full flex-col ${full ? "" : ""}`} data-testid={testid}>
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.length === 0 && (
          <div className="mx-auto max-w-lg pt-10 text-center" data-testid="chat-empty-state">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--tile)] text-white">
              <MessageSquare size={20} aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-2xl font-semibold">Chat with the knowledge graph</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Ask about any of the 13 domains, APIs, diagrams, or permit context. Answers come from the USCC knowledge
              graph.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  data-testid={`suggestion-${s.slice(0, 20).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  onClick={() => send(s)}
                  className="border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-left text-[13px] text-[var(--muted)] transition-colors hover:border-[var(--electric)]/50 hover:text-[var(--ink)]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[80%] rounded-2xl rounded-tr-sm border border-[var(--electric)]/30 bg-[var(--electric)]/15 px-4 py-3 text-sm"
                : "mr-auto max-w-[85%] rounded-2xl rounded-tl-sm border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm leading-relaxed text-[var(--muted)]"
            }
          >
            {m.text}
            {m.role === "assistant" && m.sources && m.sources.length > 0 && (
              <p className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-[var(--line)] pt-2.5">
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted)]">Sources:</span>
                {m.sources.map((s) => (
                  <span
                    key={s}
                    data-testid="citation-chip"
                    className="rounded-full border border-[var(--electric)]/30 bg-[var(--electric)]/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--accent)]"
                  >
                    {s}
                  </span>
                ))}
              </p>
            )}
          </div>
        ))}
        {busy && (
          <div className="mr-auto flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-[13px] text-[var(--muted)]">
            <span className="node-pulse h-2 w-2 rounded-full bg-[var(--electric)]" aria-hidden="true" />
            Reading the graph…
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="border-t border-[var(--line)] px-5 py-4">
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2" data-testid={`${testid}-attachments`}>
            {attachments.map((f) => (
              <FileChip key={f.id} file={f} onRemove={(r) => setAttachments((a) => a.filter((x) => x.id !== r.id))} />
            ))}
          </div>
        )}
        <label htmlFor={`${testid}-input`} className="sr-only">Ask the Knowledge Assistant</label>
        <form
          className="flex items-center gap-2 border border-[var(--line)] bg-[var(--bg)] px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            send(draft, attachments.map((f) => f.id));
            setDraft("");
          }}
        >
          <FileUpload
            compact
            context="chat"
            testid={`${testid}-upload`}
            onUploaded={(files) => setAttachments((a) => [...a, ...files])}
          />
          <input
            id={`${testid}-input`}
            data-testid={`${testid}-input`}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about a domain, API, or risk…"
            className="w-full bg-transparent text-sm placeholder:text-[var(--muted)]/60 focus:outline-none"
          />
          <button
            type="submit"
            data-testid={`${testid}-send`}
            aria-label="Send question"
            disabled={busy}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--electric)] text-[#070B14] transition-colors hover:bg-[var(--accent)] disabled:opacity-50"
          >
            <Send size={14} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------- Screens ---------- */
function CardsView({ go }) {
  const reduce = useReducedMotion();
  const cards = [
    {
      key: "assistant",
      icon: MessageSquare,
      kicker: "01 · Knowledge Assistant",
      title: "Chat with Knowledge Assistant",
      desc: "Ask the graph anything — domains, APIs, risks, permit context — and get answers in seconds.",
      testid: "start-card-assistant",
    },
    {
      key: "governance",
      icon: ShieldCheck,
      kicker: "02 · Governance",
      title: "Permit to Design · Permit to Build",
      desc: "Projects and their PTS in review at Citi. Create pre-filled templates with assistant context.",
      testid: "start-card-governance",
    },
    {
      key: "graph",
      icon: Network,
      kicker: "03 · USCC Knowledge Graph",
      title: "USCC Knowledge Graph",
      desc: "13 Cards domains, one living graph. Pick a domain to open its capabilities and diagrams.",
      testid: "start-card-graph",
    },
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-3" data-testid="start-cards">
      {cards.map((c, i) => (
        <motion.button
          key={c.key}
          type="button"
          onClick={() => go(c.key)}
          data-testid={c.testid}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="group flex flex-col border border-[var(--line)] bg-[var(--surface)]/80 p-8 text-left backdrop-blur-md transition-[border-color,transform,background-color] duration-300 hover:-translate-y-1.5 hover:border-[var(--electric)]/70 hover:bg-[var(--surface)]"
        >
          <span className="grid h-11 w-11 place-items-center border border-[var(--electric)]/40 bg-[var(--electric)]/15 text-[var(--accent)]">
            <c.icon size={18} aria-hidden="true" />
          </span>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--electric)]">{c.kicker}</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">{c.title}</h2>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted)]">{c.desc}</p>
          <span className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">
            Open <ChevronRight size={13} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </motion.button>
      ))}
    </div>
  );
}

function AssistantView() {
  return (
    <div className="flex h-full flex-col" data-testid="assistant-view">
      <ChatPanel testid="assistant-panel-full" />
    </div>
  );
}

function GovernanceView({ onCreate }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [files, setFiles] = useState([]);
  const FILTERS = ["All", "Draft", "In review", "Approved", "Not created"];
  useEffect(() => {
    if (!selected) {
      setFiles([]);
      return;
    }
    fetch(`${API}/api/files?context=${encodeURIComponent("permit:" + selected.id)}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((f) => setFiles(Array.isArray(f) ? f : []))
      .catch(() => setFiles([]));
  }, [selected]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROJECTS.filter((p) => {
      const mq = !q || p.id.toLowerCase().includes(q) || p.pts.includes(q) || p.owner.toLowerCase().includes(q);
      const mf = filter === "All" || p.status === filter.toUpperCase().replace(" ", " ");
      return mq && mf;
    });
  }, [query, filter]);
  return (
    <div className="h-full overflow-y-auto" data-testid="governance-view">
      <div className="px-5 py-6 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--accent)]">Governance · Reviews at Citi</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">Permit Dashboard</h2>
            <p className="mt-1.5 max-w-xl text-sm text-[var(--muted)]">
              Select a project, then create a Permit-to-Design pre-filled with assistant context.
            </p>
          </div>
          <div className="flex rounded-full border border-[var(--line)] bg-[var(--surface)] p-1" role="tablist" aria-label="Permit type">
            <button type="button" role="tab" aria-selected="true" data-testid="permit-type-design" className="rounded-full bg-[var(--electric)] px-5 py-2 text-[13px] font-semibold text-[#070B14]">
              Permit to Design <span className="ml-1 font-mono text-[11px] opacity-80">{PROJECTS.length}</span>
            </button>
            <button type="button" role="tab" aria-selected="false" data-testid="permit-type-ipdlc" className="rounded-full px-5 py-2 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--ink)]">
              IPDLC <span className="ml-1 font-mono text-[11px] opacity-70">61</span>
            </button>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex min-w-[240px] flex-1 items-center gap-2 border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5">
            <Search size={14} className="shrink-0 text-[var(--muted)]" aria-hidden="true" />
            <label htmlFor="gov-search" className="sr-only">Search projects</label>
            <input
              id="gov-search"
              data-testid="gov-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search work request, PTS, or owner…"
              className="w-full bg-transparent text-[13px] placeholder:text-[var(--muted)]/60 focus:outline-none"
            />
          </div>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              data-testid={`gov-filter-${f.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-2 text-[12px] font-medium transition-colors ${
                filter === f ? "border-[var(--electric)] bg-[var(--electric)]/15" : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="mt-5 overflow-x-auto border border-[var(--line)]" data-testid="gov-table">
          <table className="w-full min-w-[820px] text-left">
            <caption className="sr-only">Projects in Permit-to-Design review</caption>
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--surface)]">
                {["Work request", "PTS", "Owner", "GOC / LOB", "Approval", "PD presentation"].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const active = selected?.id === p.id;
                return (
                  <tr
                    key={p.id}
                    data-testid={`gov-row-${p.id.toLowerCase()}`}
                    aria-selected={active}
                    onClick={() => setSelected(active ? null : p)}
                    className={`cursor-pointer border-b border-[var(--line)] transition-colors last:border-0 ${active ? "bg-[var(--electric)]/12" : "hover:bg-[var(--surface)]/70"}`}
                  >
                    <td className="px-4 py-3.5 font-mono text-[13px] font-medium text-[var(--accent)]">{p.id}</td>
                    <td className="px-4 py-3.5 font-mono text-[12px]">{p.pts}</td>
                    <td className="px-4 py-3.5 text-[13px]">{p.owner}</td>
                    <td className="px-4 py-3.5 text-[12px] text-[var(--muted)]">{p.lob}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${PROJECT_STATUS_STYLES[p.status]}`}>
                        {p.status === "NOT CREATED" ? "Not created" : p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[11px] text-[var(--muted)]">
                      {p.status === "NOT CREATED" ? "—" : "Download"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {selected && (
          <div className="sticky bottom-4 z-30 mt-6 flex flex-wrap items-center gap-4 border border-[var(--electric)]/50 bg-[var(--surface-2)]/95 px-5 py-4 shadow-2xl backdrop-blur-md" data-testid="gov-selection-bar">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[var(--electric)]/15 text-[var(--accent)]">
              <Sparkles size={16} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-semibold">
                {selected.id} <span className="font-mono text-[12px] font-normal text-[var(--muted)]">· PTS {selected.pts}</span>
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                {selected.owner} · {selected.lob}
              </p>
              {files.length > 0 && (
                <span className="mt-1.5 flex flex-wrap gap-1.5" data-testid="gov-attachments">
                  {files.map((f) => (
                    <FileChip key={f.id} file={f} />
                  ))}
                </span>
              )}
            </div>
            <FileUpload
              context={`permit:${selected.id}`}
              testid="gov-upload-button"
              onUploaded={(up) => setFiles((f) => [...up, ...f])}
            />
            <button
              type="button"
              data-testid="gov-create-template-button"
              onClick={() => onCreate(selected)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--electric)] px-6 py-2.5 text-[13px] font-semibold text-[#070B14] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent)]"
            >
              <Sparkles size={13} aria-hidden="true" /> Create Template
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PermitEditorView({ project }) {
  const reduce = useReducedMotion();
  const [chatOpen, setChatOpen] = useState(true);
  const [attachments, setAttachments] = useState([]);
  useEffect(() => {
    fetch(`${API}/api/files?context=${encodeURIComponent("permit:" + project.id)}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((f) => setAttachments(Array.isArray(f) ? f : []))
      .catch(() => {});
  }, [project.id]);
  return (
    <div className="relative h-full" data-testid="permit-editor">
      <div className="h-full overflow-y-auto px-5 py-6 sm:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--accent)]">Permit to Design · Pre-filled from selection</p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          {project.id} <span className="font-mono text-base font-normal text-[var(--muted)]">· PTS {project.pts}</span>
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          The Knowledge Assistant on the right helps you complete each section with context pulled from the graph.
        </p>
        {attachments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2" data-testid="permit-attachments">
            {attachments.map((f) => (
              <FileChip key={f.id} file={f} />
            ))}
          </div>
        )}
        <div className="mt-8 grid max-w-5xl gap-6 lg:grid-cols-2">
          <section className="border border-[var(--line)] bg-[var(--surface)] p-6" aria-labelledby="sec-1">
            <h3 id="sec-1" className="font-display text-lg font-semibold">1 · Request details</h3>
            <div className="mt-4 space-y-3">
              {[
                ["GOC / LOB", project.lob],
                ["Requestor", project.owner],
                ["Template", "USCC Permit-to-Design v2.4"],
              ].map(([k, v]) => (
                <div key={k}>
                  <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">{k}</label>
                  <div className="mt-1 border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-[13px]">{v}</div>
                </div>
              ))}
            </div>
          </section>
          <section className="border border-[var(--line)] bg-[var(--surface)] p-6" aria-labelledby="sec-2">
            <h3 id="sec-2" className="font-display text-lg font-semibold">2 · Scope & domains</h3>
            <p className="mt-2 text-[13px] text-[var(--muted)]">Ask the assistant: “Which domains and systems does this request touch?”</p>
            <label htmlFor="scope-field" className="sr-only">Scope and domains</label>
            <textarea
              id="scope-field"
              data-testid="permit-scope-field"
              rows={5}
              placeholder="Impacted domains, capabilities, and systems…"
              className="mt-3 w-full border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-[13px] placeholder:text-[var(--muted)]/50 focus:outline-none"
            />
          </section>
          <section className="border border-[var(--line)] bg-[var(--surface)] p-6" aria-labelledby="sec-3">
            <h3 id="sec-3" className="font-display text-lg font-semibold">3 · Architecture context</h3>
            <p className="mt-2 text-[13px] text-[var(--muted)]">The assistant pulls existing diagrams, API coverage and past ARB decisions for the impacted domains.</p>
            <div className="mt-4 flex items-center gap-2 border border-[var(--electric)]/30 bg-[var(--electric)]/10 px-3.5 py-2.5">
              <Sparkles size={14} className="shrink-0 text-[var(--accent)]" aria-hidden="true" />
              <p className="text-[12px] text-[var(--accent)]">Graph context will be attached when you create the draft.</p>
            </div>
          </section>
          <section className="border border-[var(--line)] bg-[var(--surface)] p-6" aria-labelledby="sec-4">
            <h3 id="sec-4" className="font-display text-lg font-semibold">4 · Risk & controls</h3>
            <label htmlFor="risk-field" className="sr-only">Risk and controls</label>
            <textarea
              id="risk-field"
              data-testid="permit-risk-field"
              rows={5}
              placeholder="NFRs, controls, and open risks…"
              className="mt-3 w-full border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-[13px] placeholder:text-[var(--muted)]/50 focus:outline-none"
            />
          </section>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <FileUpload
            context={`permit:${project.id}`}
            testid="permit-upload-button"
            onUploaded={(up) => setAttachments((a) => [...a, ...up])}
          />
          <button
            type="button"
            data-testid="permit-create-draft-button"
            className="rounded-full bg-[var(--electric)] px-7 py-3 text-[13px] font-semibold text-[#070B14] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent)]"
          >
            Create draft permit
          </button>
          {!chatOpen && (
            <button
              type="button"
              data-testid="permit-chat-open-button"
              onClick={() => setChatOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--electric)]/50 px-6 py-3 text-[13px] font-semibold text-[var(--accent)] transition-colors hover:border-[var(--accent)]"
            >
              <MessageSquare size={14} aria-hidden="true" /> Open assistant
            </button>
          )}
        </div>
      </div>

      {/* Assistant drawer */}
      <AnimatePresence>
        {chatOpen && (
          <motion.aside
            initial={reduce ? false : { x: 420 }}
            animate={{ x: 0 }}
            exit={reduce ? undefined : { x: 420 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Knowledge Assistant"
            data-testid="permit-assistant-drawer"
            className="absolute inset-y-0 right-0 z-30 flex w-[min(92vw,420px)] flex-col border-l border-[var(--line-strong)] bg-[var(--surface)]"
          >
            <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3">
              <span className="grid h-8 w-8 place-items-center bg-[var(--tile)] text-white">
                <MessageSquare size={14} aria-hidden="true" />
              </span>
              <div className="flex-1">
                <p className="text-[13px] font-semibold">Knowledge Assistant</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted)]">Context for {project.id}</p>
              </div>
              <button
                type="button"
                data-testid="permit-chat-close-button"
                aria-label="Close the assistant"
                onClick={() => setChatOpen(false)}
                className="grid h-8 w-8 place-items-center text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>
            <ChatPanel domainContext={`Permit-to-Design ${project.id} (PTS ${project.pts}), ${project.lob}, requestor ${project.owner}`} testid="permit-assistant-chat" />
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function GraphView() {
  const [active, setActive] = useState(null);
  const [tab, setTab] = useState("All");
  const filtered = tab === "All" ? DIAGRAMS : DIAGRAMS.filter((d) => d.status === tab);
  const domain = active === null ? null : DOMAINS[active];
  return (
    <div className="flex h-full" data-testid="graph-view">
      <nav aria-label="USCC domains" className="hidden w-64 shrink-0 overflow-y-auto border-r border-[var(--line)] lg:block" data-testid="graph-domains">
        <p className="px-4 pb-2 pt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">USCC Knowledge Graph</p>
        <ul>
          {DOMAINS.map((d, i) => (
            <li key={d.name}>
              <button
                type="button"
                onClick={() => setActive(i)}
                data-testid={`graph-domain-${d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                aria-current={i === active ? "true" : undefined}
                className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] transition-colors ${
                  i === active ? "bg-[var(--electric)]/15 font-medium text-[var(--ink)]" : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
                }`}
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${i === active ? "bg-[var(--accent)]" : "bg-[var(--muted)]/40"}`} aria-hidden="true" />
                <span className="flex-1 truncate">{d.name}</span>
                {i === active && <ChevronRight size={13} className="text-[var(--accent)]" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
        {/* mobile domain picker */}
        <div className="mb-6 lg:hidden">
          <label htmlFor="graph-domain-select" className="sr-only">Choose a domain</label>
          <select
            id="graph-domain-select"
            data-testid="graph-domain-select"
            value={active === null ? "" : active}
            onChange={(e) => setActive(e.target.value === "" ? null : Number(e.target.value))}
            className="w-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm"
          >
            <option value="">Select one of the 13 domains…</option>
            {DOMAINS.map((d, i) => (
              <option key={d.name} value={i}>{d.name}</option>
            ))}
          </select>
        </div>

        {domain === null ? (
          <div className="flex h-full flex-col items-center justify-center text-center" data-testid="graph-empty-state">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--electric)]/40 bg-[var(--electric)]/10 px-5 py-2.5 text-sm text-[var(--accent)]">
              <Layers size={14} aria-hidden="true" /> Select one of the 13 domains to open its graph details
            </span>
            <h2 className="mt-6 max-w-md font-display text-3xl font-semibold tracking-tight">The USCC Knowledge Graph</h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
              Every Cards domain, capability, diagram, API and owner — connected. Pick a domain from the left to see its
              figures.
            </p>
          </div>
        ) : (
          <div data-testid="graph-domain-details">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              {domain.caps.length} capabilities · {domain.diagrams} diagrams · {domain.apis} APIs
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">{domain.name}</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                [Boxes, "Architecture Diagrams", `${domain.diagrams} diagrams`, "3 approved views"],
                [Layers, "Architecture Assessment", `${domain.arb} in ARB review`, "6 approved versions"],
                [ShieldCheck, "Risk & Compliance", "—", "Not available"],
                [FileSearch, "API Catalog", `${domain.apis} APIs`, "0% documented"],
              ].map(([Icon, t, s, sub]) => (
                <div key={t} className="border border-[var(--line)] bg-[var(--surface)] p-5">
                  <span className="grid h-9 w-9 place-items-center border border-[var(--electric)]/30 bg-[var(--electric)]/10 text-[var(--accent)]">
                    <Icon size={15} aria-hidden="true" />
                  </span>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">{t}</p>
                  <p className="mt-1 font-display text-lg font-semibold">{s}</p>
                  <p className="text-[12px] text-[var(--muted)]">{sub}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Diagram lifecycle">
              {["All", "DRAFT", "IN REVIEW", "APPROVED", "REJECTED"].map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  data-testid={`graph-tab-${t.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setTab(t)}
                  className={`rounded-full border px-4 py-1.5 text-[12px] font-medium transition-colors ${
                    tab === t ? "border-[var(--electric)] bg-[var(--electric)]/15" : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {t === "All" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <div className="mt-4 overflow-x-auto border border-[var(--line)]" data-testid="graph-diagram-table">
              <table className="w-full min-w-[700px] text-left">
                <caption className="sr-only">Architecture diagrams for {domain.name}</caption>
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[var(--surface)]">
                    {["Name", "Status", "Sub-domain", "Edited by", "Updated"].map((h) => (
                      <th key={h} scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr key={d.name} className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--surface)]/60">
                      <td className="px-4 py-3.5 text-[13px] font-medium">
                        {d.name} <span className="font-mono text-[11px] text-[var(--muted)]">{d.v}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${STATUS_STYLES[d.status]}`}>{d.status}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">{d.sub}</td>
                      <td className="px-4 py-3.5 text-[12px] text-[var(--muted)]">{d.editor}</td>
                      <td className="px-4 py-3.5 text-[12px] text-[var(--muted)]">{d.updated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Shell ---------- */
export default function Start() {
  const [view, setView] = useState("cards");
  const [project, setProject] = useState(null);

  const shellView = view === "cards" ? "" : view;
  const back =
    view === "editor"
      ? { label: "Dashboard", title: "Permit to Design", onBack: () => setView("governance") }
      : view !== "cards"
        ? { label: "Home", title: NAV_ITEMS.find((n) => n.key === view)?.label || "Home", onBack: () => setView("cards") }
        : null;

  return (
    <AppShell
      view={shellView}
      back={back}
      onHome={() => {
        setProject(null);
        setView("cards");
      }}
      full={view !== "cards" && view !== "governance"}
      onNavigate={(v) => {
        setProject(null);
        setView(v);
      }}
    >
      {view === "cards" && (
        <div className="blueprint-bg min-h-full">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--accent)]">Welcome to iAF</p>
            <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl" data-testid="home-heading">
              One graph. Three ways in.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)]">
              Chat with the knowledge graph, run governance for your permits, or explore the thirteen USCC domains.
            </p>
            <div className="mt-10">
              <CardsView go={(v) => setView(v)} />
            </div>
          </div>
        </div>
      )}
      {view === "assistant" && <div className="h-full"><AssistantView /></div>}
      {view === "governance" && (
        <GovernanceView
          onCreate={(p) => {
            setProject(p);
            setView("editor");
          }}
        />
      )}
      {view === "editor" && project && <PermitEditorView project={project} />}
      {view === "graph" && <GraphView />}
    </AppShell>
  );
}
