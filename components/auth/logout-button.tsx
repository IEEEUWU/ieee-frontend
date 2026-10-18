"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignOut } from "@phosphor-icons/react";
import { toast } from "sonner";
import { authRequest, withAuthLock } from "@/lib/auth/client";
import { sessionCleared, useAppDispatch } from "@/lib/auth/store";

export function LogoutButton() {
  const [pending, setPending] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  async function logout() {
    setPending(true);
    dispatch(sessionCleared());
    try { await withAuthLock(() => authRequest("logout")); }
    catch { await authRequest("clear").catch(() => {}); toast.error("Signed out locally. Server token invalidation could not be confirmed."); }
    finally { router.replace("/auth/login"); router.refresh(); setPending(false); }
  }
  return <button type="button" disabled={pending} onClick={logout} className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#A6192E] hover:bg-[#F7F9FB] disabled:opacity-50"><SignOut size={16} />{pending ? "Signing out…" : "Sign out"}</button>;
}
