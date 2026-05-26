"use client";

import { useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/GlassCard";
import { ScissorsIcon } from "@/components/icons/ScissorsIcon";
import { signInWithGoogle } from "@/lib/google-auth";
import { msg } from "@/lib/messages";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/calendar";
  const error = searchParams.get("error");

  function getLoginErrorMessage(code: string | null) {
    if (!code) return null;
    if (code === "AccessDenied") return msg.loginAccessDenied;
    return msg.loginFailed;
  }

  const loginError = getLoginErrorMessage(error);

  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-3 py-8 sm:px-4 sm:py-16">
      <GlassCard className="relative w-full max-w-md overflow-hidden p-6 sm:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-8 text-amber-900/5"
        >
          <ScissorsIcon size={160} />
        </div>

        <div className="relative space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700/90">
              {msg.loginSubtitle}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              {msg.loginTitle}
            </h1>
            <p className="text-sm leading-relaxed text-stone-500 sm:text-base">
              {msg.loginDescription}
            </p>
          </div>

          {loginError && (
            <p className="rounded-xl border border-red-100 bg-red-50/90 px-4 py-3 text-sm text-red-700">
              {loginError}
            </p>
          )}

          <button
            type="button"
            onClick={() => signInWithGoogle(callbackUrl)}
            className="flex min-h-11 w-full items-center justify-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-sm font-semibold text-stone-800 shadow-sm transition hover:border-stone-300 hover:bg-stone-50 hover:shadow-md"
          >
            <GoogleIcon />
            {msg.loginButton}
          </button>
        </div>
      </GlassCard>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
