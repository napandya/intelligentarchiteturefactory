import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SignInCard } from "@/components/Auth";

export default function Login() {
  const [params] = useSearchParams();
  const next = params.get("next") || "/start";
  return (
    <div className="blueprint-bg flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <main id="main" className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 py-16">
        <Link
          to="/"
          data-testid="login-back-link"
          className="mb-10 inline-flex w-fit items-center gap-1.5 text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Back to landing
        </Link>
        <SignInCard next={next} />
      </main>
    </div>
  );
}
