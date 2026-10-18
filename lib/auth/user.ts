export type Chapter = "SB" | "IAS" | "CS" | "WIE" | "RAS";
export type DashboardRole = "webmaster" | "secretary" | "chair";
export type AuthUser = {
  id: number;
  first_name: string;
  last_name: string;
  enrollment_number: string;
  email: string;
  chapter: Chapter;
  user_group_id: number;
  status: string;
  role: DashboardRole | null;
  effective_permissions: string[];
};
export const CHAPTER_NAMES: Record<Chapter, string> = {
  SB: "IEEE Student Branch",
  IAS: "Industry Applications Society",
  CS: "Computer Society",
  WIE: "Women in Engineering",
  RAS: "Robotics and Automation Society",
};
export const ROLE_NAMES: Record<DashboardRole, string> = { webmaster: "Webmaster", secretary: "Secretary", chair: "Chair Person" };

export function resolveDashboardRole(groupId: number): DashboardRole | null {
  const roles: Record<number, DashboardRole> = { 1: "webmaster", 2: "chair", 3: "secretary" };
  return roles[groupId] ?? null;
}
export function parseAuthUser(data: unknown): AuthUser | null {
  if (!data || typeof data !== "object") return null;
  const value = data as Record<string, unknown>;
  if (typeof value.id !== "number" || typeof value.first_name !== "string" || typeof value.last_name !== "string" || typeof value.email !== "string" || typeof value.enrollment_number !== "string" || typeof value.user_group_id !== "number" || typeof value.status !== "string" || typeof value.chapter !== "string" || !Object.hasOwn(CHAPTER_NAMES, value.chapter)) return null;
  return {
    id: value.id, first_name: value.first_name, last_name: value.last_name,
    enrollment_number: value.enrollment_number, email: value.email,
    chapter: value.chapter as Chapter, user_group_id: value.user_group_id,
    status: value.status, role: resolveDashboardRole(value.user_group_id),
    effective_permissions: Array.isArray(value.effective_permissions) ? [...new Set(value.effective_permissions.filter((code): code is string => typeof code === "string").map((code) => code.trim().toUpperCase()).filter(Boolean))] : [],
  };
}