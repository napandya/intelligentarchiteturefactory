import { useCallback, useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem("iaf-theme") || "light");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("iaf-theme", theme);
  }, [theme]);
  const toggle = useCallback(() => setTheme((t) => (t === "light" ? "dark" : "light")), []);
  return { theme, toggle };
}

export function ThemeToggle({ theme, toggle, testid = "theme-toggle" }) {
  return (
    <button
      type="button"
      onClick={toggle}
      data-testid={testid}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line-strong)] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)]"
    >
      {theme === "light" ? <Moon size={15} aria-hidden="true" /> : <Sun size={15} aria-hidden="true" />}
    </button>
  );
}
