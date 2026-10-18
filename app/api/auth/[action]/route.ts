import { currentUserResponse } from "@/lib/auth/profile";
import { backendAuth, backendError, clearSession, json, readSession, sameOrigin, saveSession } from "@/lib/auth/server";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ action: string }> }) {
  const { action } = await context.params;
  if (action === "me") return currentUserResponse();
  if (action !== "session") return json({ error: "Not found" }, 404);
  const session = await readSession();
  return session ? json({ authenticated: true, expiresAt: session.expiresAt }) : json({ authenticated: false, expiresAt: null });
}

export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  if (!sameOrigin(request)) return json({ error: "Request origin is not allowed." }, 403);
  const { action } = await context.params;
  if (action === "clear") return clearSession(json({ authenticated: false }));
  if (action !== "login" && action !== "refresh" && action !== "logout") return json({ error: "Not found" }, 404);
  const session = await readSession();
  if (action !== "login" && !session) return clearSession(json(action === "logout" ? { message: "Signed out." } : { error: "Your session has expired. Please sign in again." }, action === "logout" ? 200 : 401));
  try {
    let body: { email: string; password: string } | undefined;
    if (action === "login") {
      const input = await request.json().catch(() => null);
      if (!input || typeof input.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()) || typeof input.password !== "string" || !input.password) return json({ error: "Enter a valid email address and password." }, 422);
      body = { email: input.email.trim(), password: input.password };
    }
    const { response, data } = await backendAuth(action, session?.token, body);
    if (action === "logout") return clearSession(response.ok ? json({ message: "Successfully logged out" }) : backendError(data, response.status));
    if (!response.ok) {
      const error = backendError(data, response.status);
      return action === "refresh" && (response.status === 401 || response.status === 403) ? clearSession(error) : error;
    }
    return saveSession(data);
  } catch {
    const error = json({ error: "Unable to reach the authentication service. Please try again." }, 502);
    return action === "logout" ? clearSession(error) : error;
  }
}
