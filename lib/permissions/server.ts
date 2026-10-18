import { currentUserResponse } from "@/lib/auth/profile";
import { json, protectedBackendRequest, sameOrigin } from "@/lib/auth/server";
import type { AuthUser } from "@/lib/auth/user";
import { hasPermission, type PermissionAction } from "./shared";

export async function handlePermissionRequest(request: Request, id?: string) {
  const method = request.method;
  const page = method === "GET" && id === undefined ? new URL(request.url).searchParams.get("page") : null;
  if (page !== null && (!/^[1-9]\d*$/.test(page) || !Number.isSafeInteger(Number(page)))) return json({ error: "Invalid permission page." }, 422);
  if (method !== "GET" && !sameOrigin(request)) return json({ error: "Request origin is not allowed." }, 403);
  if (id !== undefined && !/^[1-9]\d*$/.test(id)) return json({ error: "Invalid permission ID." }, 422);
  const action: PermissionAction | undefined = method === "GET" ? "VIEW_PERMISSIONS" : method === "POST" && !id ? "CREATE_PERMISSION" : method === "PUT" && id ? "UPDATE_PERMISSION" : method === "DELETE" && id ? "DELETE_PERMISSION" : undefined;
  if (!action) return json({ error: "Method not allowed." }, 405);
  const profile = await currentUserResponse();
  if (!profile.ok) return profile;
  const user: AuthUser = await profile.json();
  if (!hasPermission(user, action)) return json({ error: `You do not have ${action} permission.` }, 403);
  let data: { permission_code: string; description: string | null } | undefined;
  if (method === "POST" || method === "PUT") {
    const input = await request.json().catch(() => null);
    if (!input || typeof input.permission_code !== "string" || !input.permission_code.trim() || input.permission_code.trim().length > 255 || (input.description !== null && typeof input.description !== "string")) return json({ error: "Enter a permission code (up to 255 characters) and a valid description." }, 422);
    data = { permission_code: input.permission_code.trim(), description: input.description };
  }
  const path = method === "GET" ? (id ? `/get-permission/${id}` : "/get-permissions") : method === "POST" ? "/create-permission" : method === "PUT" ? `/update-permission/${id}` : `/delete-permission/${id}`;
  try {
    const response = await protectedBackendRequest(path, { method, data, ...(page ? { params: { page } } : {}) });
    if (response.ok || response.status === 401) return response;
    const error = await response.json();
    const validation = error?.errors && Object.values(error.errors).flat().find((item) => typeof item === "string");
    return json({ error: validation || error.message || error.error || "Unable to complete the permission request." }, response.status);
  } catch { return json({ error: "Unable to reach the permission service. Please try again." }, 502); }
}
