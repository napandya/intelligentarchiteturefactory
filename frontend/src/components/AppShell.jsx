import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, ShieldCheck, Network, PanelLeftClose, PanelLeftOpen, LogOut, ArrowLeft } from "lucide-react";
import { IAFMark } from "@/components/shared";
import { useTheme, ThemeToggle } from "@/components/ThemeToggle";
import { logout } from "@/components/Auth";

const API = process.env.REACT_APP_BACKEND_URL;

export const NAV_ITEMS = [
  { key: "assistant", icon: MessageSquare, label: "Knowledge Assistant", kicker: "01" },
  { key: "governance", icon: ShieldCheck, label: "Governance · Permits", kicker: "02" },
  { key: "graph", icon: Network, label: "USCC Knowledge Graph", kicker: "03" },
];

export default function AppShell({ view, onNavigate, onHome, back = null, children, full = false }) {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/api/auth/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setUser(u))
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--ink)]">
      {/* COLLAPSIBLE LEFT NAV */}
      <aside
        aria-label="Primary"
        data-testid="app-sidebar"
        className={`hidden shrink-0 flex-col border-r border-[var(--line)] bg-[var(--surface)] transition-[width] duration-300 lg:flex ${
          collapsed ? "w-[68px]" : "w-64"
        }`}
      >
        <button
          type="button"
          onClick={() => (onHome ? onHome() : navigate("/start"))}
          data-testid="sidebar-home-link"
          aria-label="iAF — go to home"
          className="flex h-16 items-center gap-3 border-b border-[var(--line)] px-4 text-left transition-colors hover:bg-[var(--surface-2)]"
        >
          <IAFMark className="h-6 w-auto shrink-0" />
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold leading-tight">Intelligent Architecture Factory</span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">Home</span>
            </span>
          )}
        </button>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Workspace">
          {NAV_ITEMS.map((item) => {
            const active = view === item.key || (view === "editor" && item.key === "governance");
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                data-testid={`sidebar-nav-${item.key}`}
                aria-current={active ? "true" : undefined}
                title={collapsed ? item.label : undefined}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-[13px] transition-colors duration-150 ${
                  active
                    ? "bg-[var(--electric)]/15 font-medium text-[var(--ink)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                <item.icon size={17} className={active ? "shrink-0 text-[var(--accent)]" : "shrink-0"} aria-hidden="true" />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!collapsed && (
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted)]/70">{item.kicker}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className={`border-t border-[var(--line)] p-3 ${collapsed ? "flex flex-col items-center gap-2" : "space-y-2"}`}>
          {user && !collapsed && (
            <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5" data-testid="sidebar-user">
              {user.picture ? (
                <img src={user.picture} alt="" className="h-7 w-7 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--electric)]/20 font-mono text-[10px] text-[var(--accent)]">
                  {(user.name || user.email || "?")[0].toUpperCase()}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-medium">{user.name || user.email}</span>
                <span className="block truncate text-[10px] text-[var(--muted)]">{user.email}</span>
              </span>
              <button
                type="button"
                onClick={logout}
                data-testid="sidebar-logout-button"
                aria-label="Sign out"
                title="Sign out"
                className="grid h-7 w-7 place-items-center text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
              >
                <LogOut size={13} aria-hidden="true" />
              </button>
            </div>
          )}
          <div className={collapsed ? "" : "flex items-center gap-2"}>
            <ThemeToggle theme={theme} toggle={toggle} testid="sidebar-theme-toggle" />
            {!collapsed && (
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                data-testid="sidebar-collapse-button"
                aria-label="Collapse navigation"
                className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-3 py-1.5 text-[11px] font-semibold text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)]"
              >
                <PanelLeftClose size={13} aria-hidden="true" /> Collapse
              </button>
            )}
          </div>
          {collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              data-testid="sidebar-expand-button"
              aria-label="Expand navigation"
              className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)]"
            >
              <PanelLeftOpen size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      </aside>

      {/* MAIN COLUMN */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--line)] bg-[var(--surface)]/80 px-4 backdrop-blur-xl sm:px-6">
          <Link to="/" className="flex items-center gap-2 lg:hidden" aria-label="iAF — home" data-testid="mobile-brand-link">
            <IAFMark className="h-5 w-auto" />
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]" data-testid="shell-view-title">
            / {back ? back.title : NAV_ITEMS.find((n) => n.key === view)?.label || "Home"}
          </p>
          <div className="ml-auto flex items-center gap-3">
            {back && (
              <button
                type="button"
                data-testid="shell-back-button"
                onClick={back.onBack}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line-strong)] px-4 py-1.5 text-[12px] font-semibold transition-colors hover:border-[var(--accent)]"
              >
                <ArrowLeft size={13} aria-hidden="true" /> {back.label}
              </button>
            )}
            <span className="lg:hidden">
              <ThemeToggle theme={theme} toggle={toggle} testid="mobile-theme-toggle" />
            </span>
          </div>
        </header>

        <main id="main" className={`min-h-0 flex-1 ${full ? "overflow-hidden" : "overflow-y-auto"}`}>
          {children}
        </main>

        {/* MOBILE BOTTOM TAB BAR */}
        <nav
          aria-label="Primary"
          className="shrink-0 border-t border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur-xl lg:hidden"
          data-testid="mobile-tab-bar"
        >
          <div className="grid grid-cols-3">
            {NAV_ITEMS.map((t) => {
              const active = view === t.key || (view === "editor" && t.key === "governance");
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => onNavigate(t.key)}
                  data-testid={`mobile-tab-${t.key}`}
                  aria-current={active ? "true" : undefined}
                  className={`flex flex-col items-center gap-1 py-3 text-[10px] font-medium uppercase tracking-[0.12em] transition-colors ${
                    active ? "text-[var(--accent)]" : "text-[var(--muted)]"
                  }`}
                >
                  <t.icon size={18} aria-hidden="true" />
                  {t.key === "assistant" ? "Assistant" : t.key === "governance" ? "Permits" : "Graph"}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
