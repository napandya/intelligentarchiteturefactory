import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowLeft, FilePlus2, Download, Eye, ChevronDown, X, Sparkles } from "lucide-react";
import { CitiLogo, IAFMark } from "../components/shared";

const STATUS_STYLES = {
  DRAFT: "border-[#4C93FF]/40 bg-[#4C93FF]/10 text-[#8FD0FF]",
  "IN REVIEW": "border-[#F2A93B]/40 bg-[#F2A93B]/10 text-[#F2C14E]",
  APPROVED: "border-[#3FB97F]/40 bg-[#3FB97F]/10 text-[#5ED39A]",
  "NOT CREATED": "border-[var(--line)] bg-transparent text-[var(--muted)]",
};

const FIRST = ["Maya", "Arjun", "Sofia", "Daniel", "Priya", "Marcus", "Elena", "Ravi", "Hannah", "Tom", "Nadia", "Chris"];
const LAST = ["Ramana", "Shah", "Garcia", "Kim", "Patel", "Weber", "Santos", "Iyer", "Lindgren", "Osei", "Khan", "Brooks"];

const PROJECTS = Array.from({ length: 36 }, (_, i) => {
  const wr = `WR2024${String(4049 - i * 61).padStart(6, "0")}`;
  const pts = `2025${String(108204 - i * 764).padStart(7, "0")}`;
  const r = (n) => (i * 7 + n * 13) % 17;
  const status = r(1) % 9 === 0 ? "NOT CREATED" : r(2) % 6 === 0 ? "IN REVIEW" : r(3) % 11 === 0 ? "APPROVED" : "DRAFT";
  return {
    id: wr,
    pts,
    lob: `USCC Technology [L${(i % 4) + 5}]`,
    status,
    owner: `${FIRST[i % FIRST.length]} ${LAST[(i * 3 + 1) % LAST.length]}`,
  };
});

const FILTERS = ["All", "Draft", "In review", "Approved", "Not created"];

export default function Permits() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROJECTS.filter((p) => {
      const matchesQ = !q || p.id.toLowerCase().includes(q) || p.pts.includes(q) || p.owner.toLowerCase().includes(q);
      const matchesF = filter === "All" || p.status === filter.toUpperCase().replace(" ", " ");
      return matchesQ && matchesF;
    });
  }, [query, filter]);

  const counts = useMemo(() => {
    const c = { All: PROJECTS.length };
    FILTERS.slice(1).forEach((f) => {
      c[f] = PROJECTS.filter((p) => p.status === f.toUpperCase().replace(" ", " ")).length;
    });
    return c;
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      {/* TOP BAR */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[#070B14]/85 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <IAFMark className="h-5 w-auto" />
            <span className="hidden text-[13px] font-medium md:block">Intelligent Architecture Factory</span>
          </div>
          <Link
            to="/"
            data-testid="permits-back-link"
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--line-strong)] px-4 py-1.5 text-[12px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--accent)]"
          >
            <ArrowLeft size={13} aria-hidden="true" /> Landing
          </Link>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--accent)]">Governance · Reviews at Citi</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight" data-testid="permits-heading">
              Permit Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
              Every work request currently in review. Select a project to pre-fill its Permit-to-Design template.
            </p>
          </div>
          <div className="flex rounded-full border border-[var(--line)] bg-[var(--surface)] p-1" role="tablist" aria-label="Permit type">
            <button
              type="button"
              role="tab"
              aria-selected="true"
              data-testid="permit-type-design"
              className="rounded-full bg-[var(--electric)] px-5 py-2 text-[13px] font-semibold text-[#070B14]"
            >
              Permit to Design <span className="ml-1 font-mono text-[11px] opacity-80">{PROJECTS.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected="false"
              data-testid="permit-type-ipdlc"
              className="rounded-full px-5 py-2 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            >
              IPDLC <span className="ml-1 font-mono text-[11px] opacity-70">61</span>
            </button>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="flex min-w-[260px] flex-1 items-center gap-2 border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5">
            <Search size={14} className="shrink-0 text-[var(--muted)]" aria-hidden="true" />
            <label htmlFor="pts-search" className="sr-only">Search by work request, PTS, or owner</label>
            <input
              id="pts-search"
              data-testid="pts-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search work request, PTS, or owner…"
              className="w-full bg-transparent text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)]/60 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by approval status">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                data-testid={`filter-${f.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-4 py-2 text-[12px] font-medium transition-colors ${
                  filter === f
                    ? "border-[var(--electric)] bg-[var(--electric)]/15 text-[var(--ink)]"
                    : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
                }`}
              >
                {f} <span className="font-mono text-[10px] opacity-70">{counts[f]}</span>
              </button>
            ))}
          </div>
          <p className="ml-auto font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]" data-testid="project-count">
            {filtered.length} project{filtered.length === 1 ? "" : "s"}
          </p>
        </div>

        {/* TABLE */}
        <div className="mt-5 overflow-x-auto border border-[var(--line)]" data-testid="permits-table">
          <table className="w-full min-w-[860px] text-left">
            <caption className="sr-only">Projects currently in Permit-to-Design review</caption>
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--surface)]">
                {["Work request", "PTS", "Owner", "GOC / LOB", "Approval", "PD presentation", ""].map((h, i) => (
                  <th key={i} scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const active = selected?.id === p.id;
                return (
                  <tr
                    key={p.id}
                    data-testid={`project-row-${p.id.toLowerCase()}`}
                    aria-selected={active}
                    className={`cursor-pointer border-b border-[var(--line)] transition-colors last:border-0 ${
                      active ? "bg-[var(--electric)]/12" : "hover:bg-[var(--surface)]/70"
                    }`}
                    onClick={() => setSelected(active ? null : p)}
                  >
                    <td className="px-4 py-3.5 font-mono text-[13px] font-medium text-[var(--accent)]">{p.id}</td>
                    <td className="px-4 py-3.5 font-mono text-[12px] text-[var(--ink)]">{p.pts}</td>
                    <td className="px-4 py-3.5 text-[13px] text-[var(--ink)]">{p.owner}</td>
                    <td className="px-4 py-3.5 text-[12px] text-[var(--muted)]">{p.lob}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${STATUS_STYLES[p.status]}`}>
                        {p.status === "NOT CREATED" ? "Not created" : p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {p.status === "NOT CREATED" ? (
                        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--muted)]/60">—</span>
                      ) : (
                        <button
                          type="button"
                          data-testid={`download-${p.id.toLowerCase()}`}
                          aria-label={`Download PD presentation for ${p.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] px-2.5 py-1 text-[11px] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)]"
                        >
                          <Download size={12} aria-hidden="true" /> Download
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <ChevronDown size={14} className={`inline text-[var(--muted)] transition-transform ${active ? "rotate-180 text-[var(--accent)]" : ""}`} aria-hidden="true" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* SELECTION ACTION BAR */}
        {selected && (
          <div
            className="sticky bottom-4 z-30 mt-6 flex flex-wrap items-center gap-4 border border-[var(--electric)]/50 bg-[var(--surface-2)]/95 px-5 py-4 shadow-2xl backdrop-blur-md"
            role="status"
            data-testid="selection-bar"
          >
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[var(--electric)]/15 text-[var(--accent)]">
              <FilePlus2 size={16} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-semibold text-[var(--ink)]">
                {selected.id} <span className="font-mono text-[12px] font-normal text-[var(--muted)]">· PTS {selected.pts}</span>
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                {selected.owner} · {selected.lob} · {selected.status === "NOT CREATED" ? "Not created" : selected.status}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                data-testid="preview-presentation-button"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line-strong)] px-4 py-2 text-[12px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--accent)]"
              >
                <Eye size={13} aria-hidden="true" /> Preview deck
              </button>
              <button
                type="button"
                data-testid="create-template-button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--electric)] px-5 py-2.5 text-[13px] font-semibold text-[#070B14] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent)]"
              >
                <Sparkles size={13} aria-hidden="true" /> Create Template
              </button>
              <button
                type="button"
                data-testid="clear-selection-button"
                aria-label="Clear selection"
                onClick={() => setSelected(null)}
                className="grid h-8 w-8 place-items-center text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* PRE-FILLED TEMPLATE MODAL */}
      {open && selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="template-modal-title">
          <button type="button" aria-label="Close template" className="absolute inset-0 bg-[#04070F]/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg border border-[var(--line-strong)] bg-[var(--surface)]" data-testid="template-modal">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--electric)]">Pre-filled from selection</p>
                <h2 id="template-modal-title" className="mt-1 font-display text-xl font-semibold">Permit to Design template</h2>
              </div>
              <button
                type="button"
                data-testid="template-close-button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
              >
                <X size={17} aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-4 px-6 py-6">
              {[
                ["Work request", selected.id],
                ["PTS", selected.pts],
                ["GOC / LOB", selected.lob],
                ["Requestor", selected.owner],
                ["Approval state", selected.status === "NOT CREATED" ? "Not created" : selected.status],
                ["Template", "USCC Permit-to-Design v2.4"],
              ].map(([k, v]) => (
                <div key={k}>
                  <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">{k}</label>
                  <div className="mt-1 border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-[13px] text-[var(--ink)]">{v}</div>
                </div>
              ))}
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--accent)]">
                Agents will draft the self-assessment from the knowledge graph on create
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-[var(--line)] px-6 py-4">
              <button
                type="button"
                data-testid="template-cancel-button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-[var(--line-strong)] px-5 py-2.5 text-[13px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--accent)]"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="template-create-confirm"
                className="rounded-full bg-[var(--electric)] px-6 py-2.5 text-[13px] font-semibold text-[#070B14] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent)]"
              >
                Create draft permit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
