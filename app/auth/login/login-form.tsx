"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeSlash } from "@phosphor-icons/react";
import { toast } from "sonner";
import { authRequest, withAuthLock } from "@/lib/auth/client";
import { pendingChanged, sessionReceived, profileCleared, useAppDispatch, useAppSelector } from "@/lib/auth/store";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const pending = useAppSelector((state) => state.auth.pending);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    dispatch(pendingChanged(true));
    try {
      const session = await withAuthLock(() => authRequest("login", { email: String(fields.get("email")).trim(), password: String(fields.get("password")) }));
      dispatch(profileCleared());
      dispatch(sessionReceived(session));
      form.reset();
      // Reload from the server after Set-Cookie, avoiding stale route state.
      window.location.replace("/admin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in. Please try again.");
    } finally { dispatch(pendingChanged(false)); }
  }
  const inputClass = "h-12 w-full rounded-xl border border-[#0B1B2B26] bg-[#F7F9FB] px-4 text-[15px] text-[#0B1B2B] placeholder:text-[#667585] transition-colors focus:border-[#00629B] focus:bg-white";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          title="Enter your email address."
          placeholder="Enter your email address"
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Enter your password"
            className={`${inputClass} pr-14`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            aria-controls="password"
            className="absolute top-1 right-1 flex h-10 w-10 items-center justify-center rounded-lg text-[#4A5B6B] transition-colors hover:bg-[#00629B0D] hover:text-[#00629B]"
          >
            {showPassword ? <EyeSlash size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>
      <button type="submit" disabled={pending} aria-busy={pending} className="mt-1 flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-[#00629B] px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#005282] disabled:cursor-wait disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"} <ArrowRight size={18} weight="bold" aria-hidden="true" />
      </button>
    </form>
  );
}

