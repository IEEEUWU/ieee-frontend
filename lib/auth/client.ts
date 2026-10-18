import axios from "axios";
export class AuthError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function authRequest(action: string, body?: unknown) {
  const response = await axios.request({
    url: `/api/auth/${action}`,
    method: action === "session" ? "GET" : "POST",
    withCredentials: true,
    headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
    data: body,
    timeout: 20000,
    validateStatus: () => true,
  });
  const data = response.data;
  if (response.status < 200 || response.status >= 300) throw new AuthError(data?.error || "The request failed. Please try again.", response.status);
  return data as { authenticated: boolean; expiresAt: number | null };
}
// Serialize rotation and logout across tabs sharing the same cookie.
let authQueue: Promise<unknown> = Promise.resolve();
export async function withAuthLock<T>(callback: () => Promise<T>): Promise<T> {
  if (navigator.locks) return navigator.locks.request("ieee-auth-session", callback);
  const operation = authQueue.then(callback, callback);
  authQueue = operation.catch(() => {});
  return operation;
}

let refreshPromise: ReturnType<typeof authRequest> | null = null;
export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = withAuthLock(async () => {
      const session = await authRequest("session");
      if (!session.authenticated || !session.expiresAt) throw new AuthError("Your session has expired. Please sign in again.", 401);
      return session.expiresAt - Date.now() > 65000 ? session : authRequest("refresh");
    }).finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

// Use for same-origin protected server routes; bearer tokens stay on the server.
export async function protectedFetch(input: string, init?: RequestInit) {
  const url = new URL(input, window.location.origin);
  if (url.origin !== window.location.origin) throw new Error("Protected requests must use a same-origin server route.");
  const session = await authRequest("session");
  if (session.authenticated && session.expiresAt && session.expiresAt - Date.now() <= 65000) await refreshSession();
  const upstream = await axios.request({
    url: url.toString(),
    method: init?.method ?? "GET",
    headers: Object.fromEntries(new Headers(init?.headers).entries()),
    data: init?.body,
    signal: init?.signal ?? undefined,
    withCredentials: true,
    timeout: 20000,
    validateStatus: () => true,
  });
  const response = new Response(upstream.status === 204 ? null : JSON.stringify(upstream.data), { status: upstream.status, headers: { "Content-Type": "application/json" } });
  if (response.status === 401 || (response.status === 403 && url.pathname === "/api/auth/me")) {
    await authRequest("clear").catch(() => {});
    window.dispatchEvent(new Event("ieee-auth-expired"));
  }
  return response;
}
