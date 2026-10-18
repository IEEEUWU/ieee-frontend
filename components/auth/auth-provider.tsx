"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { makeStore, sessionInitialized, sessionReceived, sessionCleared, useAppDispatch, useAppSelector } from "@/lib/auth/store";
import { AuthError, authRequest, refreshSession } from "@/lib/auth/client";

function SessionLifecycle() {
  const dispatch = useAppDispatch();
  const { status, expiresAt } = useAppSelector((state) => state.auth);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    authRequest("session").then((session) => { if (active) dispatch(sessionInitialized(session)); }).catch(() => { if (active) dispatch(sessionInitialized({ authenticated: false })); });
    const expired = () => { dispatch(sessionCleared()); toast.error("Your session has expired. Please sign in again."); router.replace("/auth/login"); router.refresh(); };
    window.addEventListener("ieee-auth-expired", expired);
    return () => { active = false; window.removeEventListener("ieee-auth-expired", expired); };
  }, [dispatch, router]);

  useEffect(() => {
    if (status === "anonymous" && pathname.startsWith("/admin")) router.replace("/auth/login");
  }, [status, pathname, router]);

  useEffect(() => {
    if (status !== "authenticated" || !expiresAt) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const run = async () => {
      try {
        const session = await refreshSession();
        if (!cancelled) dispatch(sessionReceived(session));
      } catch (error) {
        if (cancelled) return;
        if ((error instanceof AuthError && (error.status === 401 || error.status === 403)) || Date.now() >= expiresAt) {
          await authRequest("clear").catch(() => {});
          if (!cancelled) { dispatch(sessionCleared()); toast.error(error instanceof Error ? error.message : "Please sign in again."); router.replace("/auth/login"); router.refresh(); }
        } else {
          toast.error("Could not refresh your session. Retrying shortly.");
          timer = setTimeout(run, Math.min(10000, Math.max(0, expiresAt - Date.now())));
        }
      }
    };
    timer = setTimeout(run, Math.max(0, expiresAt - Date.now() - 60000));
    const resume = () => { if (document.visibilityState === "visible" && Date.now() >= expiresAt - 60000) { clearTimeout(timer); void run(); } };
    document.addEventListener("visibilitychange", resume);
    return () => { cancelled = true; clearTimeout(timer); document.removeEventListener("visibilitychange", resume); };
  }, [status, expiresAt, dispatch, router]);
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore);
  return <Provider store={store}><SessionLifecycle />{children}<Toaster position="top-right" richColors closeButton /></Provider>;
}
