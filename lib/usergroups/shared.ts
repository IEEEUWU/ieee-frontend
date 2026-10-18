import type { AuthUser } from "@/lib/auth/user";
import { hasPermission } from "@/lib/permissions/shared";

export const USERGROUP_ACTIONS = ["CREATE_USERGROUP", "VIEW_USERGROUPS", "UPDATE_USERGROUP", "DELETE_USERGROUP", "ASSIGN_USERGROUP_PERMISSIONS"] as const;
export type UserGroup = {
  id: number;
  group_name: string;
  group_description: string | null;
  permissions: (number | string)[] | null;
};
export function canManageUserGroups(user: AuthUser | null) {
  return USERGROUP_ACTIONS.some((code) => hasPermission(user, code));
}
