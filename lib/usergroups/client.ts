import { protectedFetch } from "@/lib/auth/client";
import { loadPermissionCatalogue } from "@/lib/permissions/client";
import type { PermissionRecord } from "@/lib/permissions/shared";
import type { UserGroup } from "./shared";

export async function userGroupRequest(path = "", method = "GET", body?: unknown, signal?: AbortSignal) {
  if (method === "PUT" && body && typeof body === "object" && "permissions" in body) {
    const values: unknown = body.permissions;
    if (!Array.isArray(values)) throw new Error("Select valid permission IDs.");
    const records = values.some((value) => typeof value === "string") ? await loadSelectablePermissions(signal) : [];
    const ids = values.map((value: unknown) => {
      const id = typeof value === "string" ? records.find((record) => record.permission_code === value)?.id : value;
      if (typeof id !== "number" || !Number.isSafeInteger(id) || id < 1) throw new Error("A selected permission is unavailable. Reload permissions before saving.");
      return id;
    });
    body = { ...body, permissions: permissionValues(ids) };
  }
  const response = await protectedFetch(`/api/usergroups${path}`, {
    method, signal, headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(result?.error || "Unable to complete the user group request.");
  return result;
}

export function parseUserGroup(input: unknown): UserGroup {
  if (!input || typeof input !== "object") throw new Error("The user group service returned invalid data.");
  const record = input as Record<string, unknown>;
  if (typeof record.id !== "number" || !Number.isSafeInteger(record.id) || record.id < 1 || typeof record.group_name !== "string" || (record.group_description !== null && typeof record.group_description !== "string")) throw new Error("The user group service returned invalid data.");
  let permissions: UserGroup["permissions"] = null;
  if (record.permissions !== undefined && record.permissions !== null) {
    if (!Array.isArray(record.permissions)) throw new Error("The user group service returned invalid permissions.");
    permissions = record.permissions.map((value: unknown) => {
      if (typeof value === "number" && Number.isSafeInteger(value) && value > 0) return value;
      if (typeof value === "string" && value.trim()) return value;
      if (value && typeof value === "object") {
        const permission = value as Record<string, unknown>;
        if (typeof permission.id === "number" && Number.isSafeInteger(permission.id) && permission.id > 0) return permission.id;
        if (typeof permission.permission_code === "string" && permission.permission_code.trim()) return permission.permission_code;
      }
      throw new Error("The user group service returned invalid permissions.");
    });
  }
  return { id: record.id, group_name: record.group_name, group_description: record.group_description as string | null, permissions };
}

export type UserGroupCatalogue = { data: UserGroup[]; current_page: number; last_page: number; total: number; from: number | null; to: number | null };
export async function loadUserGroups(page = 1, signal?: AbortSignal): Promise<UserGroupCatalogue> {
  const input: unknown = await userGroupRequest(`?page=${page}`, "GET", undefined, signal);
  if (Array.isArray(input)) return { data: input.map(parseUserGroup), current_page: 1, last_page: 1, total: input.length, from: input.length ? 1 : null, to: input.length || null };
  if (!input || typeof input !== "object") throw new Error("The user group service returned an invalid catalogue.");
  const result = input as Record<string, unknown>;
  const integer = (value: unknown, min: number): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= min;
  if (!Array.isArray(result.data) || result.current_page !== page || !integer(result.last_page, 1) || !integer(result.total, 0) || !(result.from === null || integer(result.from, 1)) || !(result.to === null || integer(result.to, 1))) throw new Error("The user group service returned an invalid catalogue.");
  return { data: result.data.map(parseUserGroup), current_page: page, last_page: result.last_page, total: result.total, from: result.from, to: result.to };
}

export async function loadSelectablePermissions(signal?: AbortSignal): Promise<PermissionRecord[]> {
  const first = await loadPermissionCatalogue(1, signal);
  const records = [...first.data];
  for (let page = 2; page <= first.last_page; page += 1) records.push(...(await loadPermissionCatalogue(page, signal)).data);
  return [...new Map(records.map((record) => [record.id, record])).values()];
}

export function permissionValues(ids: number[]): number[] {
  return [...new Set(ids)];
}
