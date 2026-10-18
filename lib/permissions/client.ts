import { protectedFetch } from "@/lib/auth/client";
import type { PermissionRecord } from "./shared";
export async function permissionRequest(path = "", method = "GET", body?: unknown, signal?: AbortSignal) {
  const response = await protectedFetch(`/api/permissions${path}`, {
    method, signal,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || "Unable to complete the permission request.");
  return data;
}
export function parsePermission(data: unknown): PermissionRecord {
  if (!data || typeof data !== "object") throw new Error("The permission service returned invalid data.");
  const record = data as Record<string, unknown>;
  if (typeof record.id !== "number" || typeof record.permission_code !== "string" || (record.description !== null && typeof record.description !== "string")) throw new Error("The permission service returned invalid data.");
  return { id: record.id, permission_code: record.permission_code, description: record.description as string | null };
}

export type PermissionCatalogue = {
  data: PermissionRecord[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

export async function loadPermissionCatalogue(page = 1, signal?: AbortSignal): Promise<PermissionCatalogue> {
  const response: unknown = await permissionRequest(`?page=${page}`, "GET", undefined, signal);
  if (!response || typeof response !== "object") throw new Error("The permission service returned an invalid catalogue.");
  const catalogue = response as Record<string, unknown>;
  const integer = (value: unknown, minimum: number): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= minimum;
  if (!Array.isArray(catalogue.data) || catalogue.current_page !== page || !integer(catalogue.last_page, 1) || !integer(catalogue.per_page, 1) || !integer(catalogue.total, 0) ||
    !(catalogue.from === null || integer(catalogue.from, 1)) || !(catalogue.to === null || integer(catalogue.to, 1))) {
    throw new Error("The permission service returned an invalid catalogue.");
  }
  return { data: catalogue.data.map(parsePermission), current_page: page, last_page: catalogue.last_page, per_page: catalogue.per_page, total: catalogue.total, from: catalogue.from, to: catalogue.to };
}
