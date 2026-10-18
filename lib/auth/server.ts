import axios, { AxiosHeaders, type AxiosRequestConfig, type RawAxiosHeaders } from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const AUTH_COOKIE = "ieee_access_token";
export type Session = { token: string; expiresAt: number };
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };

export async function readSession(): Promise<Session | null> {
  try {
    const value = (await cookies()).get(AUTH_COOKIE)?.value;
    if (!value) return null;
    const session = JSON.parse(value) as Session;
    return typeof session.token === "string" && session.token.length > 0 && Number.isFinite(session.expiresAt) && session.expiresAt > Date.now() ? session : null;
  } catch { return null; }
}

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function clearSession(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return response;
}

export function saveSession(data: unknown) {
  const value = data as { access_token?: unknown; token_type?: unknown; expires_in?: unknown } | null;
  if (!value || typeof value.access_token !== "string" || !value.access_token || typeof value.token_type !== "string" || value.token_type.toLowerCase() !== "bearer" || typeof value.expires_in !== "number" || !Number.isFinite(value.expires_in) || value.expires_in <= 0) {
    return json({ error: "The authentication service returned an invalid response." }, 502);
  }
  const expiresAt = Date.now() + value.expires_in * 1000;
  const response = json({ authenticated: true, expiresAt });
  response.cookies.set(AUTH_COOKIE, JSON.stringify({ token: value.access_token, expiresAt }), { ...cookieOptions, expires: new Date(expiresAt) });
  return response;
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
}

export function getBackendApiBaseUrl() {
  const configured = process.env.AUTH_API_BASE_URL?.trim();
  if (!configured) throw new Error("AUTH_API_BASE_URL must be set in .env.");
  const url = new URL(configured);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error("AUTH_API_BASE_URL must be an HTTP(S) base URL without credentials, query parameters, or a fragment.");
  }
  return url.toString().replace(/\/+$/, "");
}
export async function backendAuth(action: "login" | "refresh" | "logout", token?: string, body?: { email: string; password: string }) {
  const base = getBackendApiBaseUrl();
  const response = await axios.post<unknown>(`${base}/auth/${action}`, body, {
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token && action !== "login" ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 15000,
    maxRedirects: 0,
    validateStatus: () => true,
  });
  return { response: { ok: response.status >= 200 && response.status < 300, status: response.status }, data: response.data };
}
export function backendError(data: unknown, status: number) {
  const value = data as { error?: unknown; message?: unknown; errors?: Record<string, unknown> } | null;
  const validation = value?.errors && Object.values(value.errors).flat().find((item) => typeof item === "string");
  const error = typeof value?.error === "string" ? value.error : typeof validation === "string" ? validation : typeof value?.message === "string" ? value.message : status === 401 ? "Invalid email or password" : status === 403 ? "Your account is suspended." : status === 422 ? "Please check your email and password." : "The authentication service is unavailable. Please try again.";
  return json({ error }, status);
}

//protected API route handlers
export async function protectedBackendRequest(path: string, init?: Omit<AxiosRequestConfig, "headers"> & { headers?: RawAxiosHeaders | AxiosHeaders }) {
  if (!path.startsWith("/") || path.startsWith("//")) throw new Error("Use a relative backend API path.");
  const session = await readSession();
  if (!session) return clearSession(json({ error: "Please sign in again." }, 401));
  const base = getBackendApiBaseUrl();
  const headers = AxiosHeaders.from(init?.headers);
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${session.token}`);
  const response = await axios.request<unknown>({
    ...init,
    url: `${base}${path}`,
    method: init?.method ?? "GET",
    headers,
    timeout: 15000,
    maxRedirects: 0,
    validateStatus: () => true,
  });
  if (response.status === 204) return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  const result = json(response.data, response.status);
  return response.status === 401 ? clearSession(result) : result;
}