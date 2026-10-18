import type { AuthUser } from "@/lib/auth/user";
export const PERMISSION_ACTIONS = ["CREATE_PERMISSION", "VIEW_PERMISSIONS", "UPDATE_PERMISSION", "DELETE_PERMISSION"] as const;
export type PermissionAction = typeof PERMISSION_ACTIONS[number];
export type PermissionRecord = { id: number; permission_code: string; description: string | null };
export function hasPermission(user: AuthUser | null, code: string) {
  const granted = user?.effective_permissions ?? [];
  return user?.status === "active" && (granted.includes(code.toUpperCase()) || granted.includes("*"));
}
export function canManagePermissions(user: AuthUser | null) {
  return PERMISSION_ACTIONS.some((code) => hasPermission(user, code));
}