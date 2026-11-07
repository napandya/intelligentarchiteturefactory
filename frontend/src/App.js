import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import Landing from "@/pages/Landing";
import Workspace from "@/pages/Workspace";
import Home from "@/pages/Home";
import OptionA from "@/pages/OptionA";
import OptionB from "@/pages/OptionB";
import OptionC from "@/pages/OptionC";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function SmoothScroll({ children }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.09 });
    let raf;
    const loop = (t) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onAnchor = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const el = document.querySelector(a.getAttribute("href"));
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el, { offset: -72 });
        el.setAttribute("tabindex", "-1");
        el.focus({ preventScroll: true });
      }
    };
    document.addEventListener("click", onAnchor);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      document.removeEventListener("click", onAnchor);
    };
  }, []);
  return children;
}

function App() {
  return (
    <div className="App grain">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <BrowserRouter>
        <SmoothScroll>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<Workspace />} />
            <Route path="/options" element={<Home />} />
            <Route path="/a" element={<OptionA />} />
            <Route path="/b" element={<OptionB />} />
            <Route path="/c" element={<OptionC />} />
          </Routes>
        </SmoothScroll>
      </BrowserRouter>
    </div>
  );
}

export default App;
