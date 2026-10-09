"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "@phosphor-icons/react";
import {
  INITIAL_ADMIN_USERS,
  setActiveUser,
  type AdminUser,
} from "@/lib/srs-data";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSelectPersona = (user: AdminUser) => {
    setActiveUser(user.id);
    router.push("/admin");
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    // Match any known persona or default to SB Webmaster
    const user = INITIAL_ADMIN_USERS.find(
      (u) => u.username === username.trim() || u.email === username.trim(),
    );
    if (user) {
      setActiveUser(user.id);
      router.push("/admin");
    } else {
      // Default to sb_webmaster for demonstration
      setActiveUser("user-sb-webmaster");
      router.push("/admin");
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-[#F7F9FB] p-6 font-sans text-[#111111]">
      <div className="flex w-full max-w-[580px] flex-col gap-8 rounded-3xl border border-[#D9D9D9] bg-white p-8 md:p-12 shadow-xs">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00629B] font-mono text-base font-bold text-white">
            UWU
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#111111]">
            IEEE Administrative Login
          </h1>
          <p className="mt-1 text-sm text-[#667585]">
            Single shared login console for branch & chapter administrators (FR-ACC-01)
          </p>
        </div>

        {/* Quick Role Switcher (Pre-Seeded Personas for Review) */}
        <div className="flex flex-col gap-3 rounded-2xl border border-[#00629B33] bg-[#00629B0A] p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00629B]">
            <ShieldCheck size={18} weight="bold" />
            <span>TEST PERSONA 1-CLICK ACCESS (SRS §3)</span>
          </div>
          <p className="text-xs text-[#4A5B6B]">
            Select an administrative role to test scoped authorization boundaries:
          </p>
          <div className="grid grid-cols-1 gap-2 pt-1">
            {INITIAL_ADMIN_USERS.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelectPersona(user)}
                className="flex items-center justify-between rounded-xl border border-[#D9D9D9] bg-white px-4 py-2.5 text-left text-xs transition-colors hover:border-[#00629B] hover:bg-[#F7F9FB]"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-[#111111]">{user.name}</span>
                  <span className="font-mono text-[11px] text-[#667585]">
                    {user.role.toUpperCase()} ·{" "}
                    {user.assignedUnitId
                      ? `Unit: ${user.assignedUnitId.toUpperCase()}`
                      : user.assignedEventId
                        ? "Event Delegate"
                        : "Global Apex"}
                  </span>
                </div>
                <ArrowRight size={14} className="text-[#00629B]" weight="bold" />
              </button>
            ))}
          </div>
        </div>

        {/* Traditional Credentials Form */}
        <form onSubmit={handleManualLogin} className="flex flex-col gap-4 border-t border-[#E2E8F0] pt-6">
          <span className="font-mono text-xs uppercase tracking-wider text-[#667585]">
            OR SIGN IN WITH CREDENTIALS
          </span>

          {error ? (
            <div className="rounded-xl border border-[#A6192E33] bg-[#A6192E0D] p-3 text-xs text-[#A6192E]">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-xs font-semibold text-[#111111]">
              Login Identity (Username or Email)
            </label>
            <input
              id="username"
              type="text"
              placeholder="e.g. sb_webmaster or cs_webmaster"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-[#D9D9D9] bg-white p-3 text-sm outline-none focus:border-[#00629B]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-[#111111]">
              Administrative Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#D9D9D9] bg-white p-3 text-sm outline-none focus:border-[#00629B]"
            />
          </div>

          <button
            type="submit"
            className="mt-2 rounded-full bg-[#00629B] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#005282]"
          >
            Authenticate & Proceed to Console
          </button>
        </form>

        <div className="flex items-center justify-center border-t border-[#E2E8F0] pt-4">
          <Link href="/" className="text-xs text-[#667585] hover:text-[#00629B] hover:underline">
            &larr; Return to public website
          </Link>
        </div>
      </div>
    </main>
  );
}
