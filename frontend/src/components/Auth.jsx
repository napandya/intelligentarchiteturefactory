import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IAFMark } from "@/components/shared";

const API = process.env.REACT_APP_BACKEND_URL;

const GoogleG = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.63h6.45a5.5 5.5 0 0 1-2.39 3.62v3h3.86c2.26-2.09 3.58-5.16 3.58-8.8z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.14-4.07 1.14-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.64H1.29a12 12 0 0 0 0 10.72l3.98-3.09z" />
    <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.29 6.64l3.98 3.09C6.22 6.88 8.87 4.77 12 4.77z" />
  </svg>
);

export function SignInCard({ next = "/start", testid = "sign-in" }) {
  const login = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + next;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };
  return (
    <div className="mx-auto max-w-md border border-[var(--line)] bg-[var(--surface)] p-10 text-center" data-testid={testid}>
      <div className="mx-auto w-fit">
        <IAFMark className="h-9 w-auto" />
      </div>
      <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">Sign in to iAF</h1>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
        The workspace is for your team only. Sign in with your Google account to continue.
      </p>
      <button
        type="button"
        onClick={login}
        data-testid={`${testid}-google-button`}
        className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[var(--ink)] px-6 py-3.5 text-sm font-semibold text-[#070B14] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent)]"
      >
        <GoogleG /> Continue with Google
      </button>
    </div>
  );
}

export function AuthCallback({ next = "/start" }) {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    const process = async () => {
      try {
        const sessionId = new URLSearchParams(window.location.hash.slice(1)).get("session_id");
        if (!sessionId) throw new Error("no session id");
        const res = await fetch(`${API}/api/auth/session`, {
          method: "POST",
          headers: { "X-Session-ID": sessionId },
          credentials: "include",
        });
        if (!res.ok) throw new Error("session failed");
        const user = await res.json();
        window.history.replaceState(null, "", window.location.pathname);
        navigate(next, { replace: true, state: { user } });
      } catch {
        setFailed(true);
      }
    };
    process();
  }, [navigate, next]);

  if (failed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6" data-testid="auth-callback-failed">
        <div className="max-w-sm text-center">
          <IAFMark className="mx-auto h-8 w-auto" />
          <p className="mt-6 font-display text-xl font-semibold">Sign-in didn&apos;t complete</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            Your browser blocked the sign-in session. Try again — and if it repeats, enable cross-site cookies for this
            site in your browser settings.
          </p>
          <button
            type="button"
            data-testid="auth-retry-button"
            onClick={() => navigate("/login?next=" + encodeURIComponent(next), { replace: true })}
            className="mt-6 rounded-full bg-[var(--electric)] px-6 py-3 text-sm font-semibold text-[#070B14] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent)]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]" data-testid="auth-callback">
      <div className="text-center">
        <span className="node-pulse mx-auto block h-2.5 w-2.5 rounded-full bg-[var(--electric)]" aria-hidden="true" />
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">Signing you in…</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children, next = "/start" }) {
  const navigate = useNavigate();
  const [state, setState] = useState({ status: null, user: null });

  useEffect(() => {
    // CRITICAL: if returning from OAuth callback, skip the /me check — AuthCallback exchanges it first
    if (window.location.hash?.includes("session_id=")) return;
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(`${API}/api/auth/me`, { credentials: "include" });
        if (!res.ok) throw new Error("not authenticated");
        const user = await res.json();
        if (!cancelled) setState({ status: true, user });
      } catch {
        if (!cancelled) navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true });
      }
    };
    check();
    return () => {
      cancelled = true;
    };
  }, [navigate, next]);

  if (state.status === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]" data-testid="auth-loading">
        <span className="node-pulse h-2.5 w-2.5 rounded-full bg-[var(--electric)]" aria-hidden="true" />
      </div>
    );
  }
  return children(state.user);
}

export async function logout() {
  await fetch(`${API}/api/auth/logout`, { method: "POST", credentials: "include" });
  window.location.href = "/";
}
