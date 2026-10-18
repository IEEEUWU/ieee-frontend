"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { protectedFetch } from "@/lib/auth/client";
import { profileReceived, useAppDispatch, useAppSelector } from "@/lib/auth/store";

export function AdminProfileGate({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (user && Array.isArray(user.effective_permissions)) return;
    let active = true;
    async function load() {
      try {
        const response = await protectedFetch("/api/auth/me");
        const data = await response.json();
        if (!active || response.status === 401) return;
        if (!response.ok) throw new Error(data.error || "Unable to load your account.");
        dispatch(profileReceived(data));
      } catch (failure) {
        if (!active) return;
        const message = failure instanceof Error ? failure.message : "Unable to load your account.";
        setError(message); toast.error(message);
      }
    }
    void load();
    return () => { active = false; };
  }, [user, dispatch, attempt]);
  if (user) return children;
  return <main className="flex min-h-svh items-center justify-center bg-[#F7F9FB] px-6 font-plex"><div className="w-full max-w-md rounded-3xl border border-[#0B1B2B14] bg-white p-8 text-center"><h1 className="text-2xl font-semibold text-[#0B1B2B]">{error ? "Account unavailable" : "Loading your workspace"}</h1><p role="status" className="mt-3 text-sm text-[#4A5B6B]">{error || "Fetching your account details…"}</p>{error && <button onClick={() => { setError(""); setAttempt((value) => value + 1); }} className="mt-6 rounded-full bg-[#00629B] px-6 py-3 text-sm font-semibold text-white">Try again</button>}</div></main>;
}