import { currentUserResponse } from "@/lib/auth/profile";
import { json, protectedBackendRequest, sameOrigin } from "@/lib/auth/server";
import type { AuthUser } from "@/lib/auth/user";
import { hasPermission } from "@/lib/permissions/shared";

export async function handleUserGroupRequest(request: Request, id?: string, assign = false) {
  const method = request.method;
  if (method !== "GET" && !sameOrigin(request)) return json({ error: "Request origin is not allowed." }, 403);
  if (id !== undefined && !/^[1-9]\d*$/.test(id)) return json({ error: "Invalid user group ID." }, 422);
  const action = assign && method === "POST" ? "ASSIGN_USERGROUP_PERMISSIONS" : !assign && method === "GET" && !id ? "VIEW_USERGROUPS" : !assign && method === "POST" && !id ? "CREATE_USERGROUP" : !assign && method === "PUT" && id ? "UPDATE_USERGROUP" : !assign && method === "DELETE" && id ? "DELETE_USERGROUP" : null;
  if (!action) return json({ error: "Method not allowed." }, 405);
  const profile = await currentUserResponse();
  if (!profile.ok) return profile;
  const user: AuthUser = await profile.json();
  if (!hasPermission(user, action)) return json({ error: `You do not have ${action} permission.` }, 403);
  const page = method === "GET" ? new URL(request.url).searchParams.get("page") : null;
  if (page !== null && (!/^[1-9]\d*$/.test(page) || !Number.isSafeInteger(Number(page)))) return json({ error: "Invalid user group page." }, 422);
  let data: Record<string, unknown> | undefined;
  if (method === "POST" || method === "PUT") {
    const input = await request.json().catch(() => null);
    if (!input || !Array.isArray(input.permissions) || !input.permissions.every((value: unknown) => typeof value === "number" && Number.isSafeInteger(value) && value > 0)) return json({ error: "Select valid permission IDs." }, 422);
    const permissions = [...new Set(input.permissions)];
    if (assign) {
      if (!Number.isSafeInteger(input.user_group_id) || input.user_group_id < 1) return json({ error: "Choose a valid user group." }, 422);
      data = { user_group_id: input.user_group_id, permissions };
    } else {
      if (typeof input.group_name !== "string" || !input.group_name.trim() || input.group_name.trim().length > 255 || (input.group_description !== null && typeof input.group_description !== "string")) return json({ error: "Enter a group name (up to 255 characters) and a valid description." }, 422);
      data = { group_name: input.group_name.trim(), group_description: input.group_description, permissions };
    }
  }
  const path = assign ? "/assign-usergroup-permissions" : method === "GET" ? "/get-usergroups" : method === "POST" ? "/create-usergroup" : method === "PUT" ? `/update-usergroup/${id}` : `/delete-usergroup/${id}`;
  try {
    const response = await protectedBackendRequest(path, { method, data, ...(page ? { params: { page } } : {}) });
    if (response.ok || response.status === 401) return response;
    const failure = await response.json();
    const validation = failure?.errors && Object.values(failure.errors).flat().find((value) => typeof value === "string");
    return json({ error: validation || failure.message || failure.error || "Unable to complete the user group request." }, response.status);
  } catch { return json({ error: "Unable to reach the user group service. Please try again." }, 502); }
}
