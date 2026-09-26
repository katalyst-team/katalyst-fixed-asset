import { useUser } from "@/context/user-context";

const ADMIN_ROLES = ["APP_SUPERADMIN", "APP_ADMIN"];
const MANAGER_ROLES = ["ORGANIZATION_OWNER", "ORGANIZATION_ADMIN"];

export function useFaPermission() {
  const { tokenPayload } = useUser();
  const permissions = tokenPayload?.permissions ?? [];
  const role = tokenPayload?.role ?? "";

  const isAdmin = ADMIN_ROLES.includes(role);
  const isManager = isAdmin || MANAGER_ROLES.includes(role);

  const hasAnyPermission = (names: string[]): boolean => {
    if (isAdmin) return true;
    return permissions.some((p) => names.includes(p.name));
  };

  const hasPermission = (name: string): boolean => hasAnyPermission([name]);

  return {
    canCreate: isManager || hasAnyPermission(["ORGANIZATION_CREATE_ALL"]),
    canDelete: isManager || hasAnyPermission(["ORGANIZATION_DELETE_ALL"]),
    canManage: isManager || hasAnyPermission(["ORGANIZATION_UPDATE_ALL"]),
    canManageSettings:
      isAdmin || hasAnyPermission(["ORGANIZATION_OWNER", "ORGANIZATION_UPDATE_ALL"]),
    canManageUsers:
      isAdmin || hasAnyPermission(["ORGANIZATION_OWNER", "ORGANIZATION_UPDATE_ALL"]),
    hasAnyPermission,
    hasPermission,
    isAdmin,
    isManager,
    permissions,
    role,
  };
}
