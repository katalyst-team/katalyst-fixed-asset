import { useUser } from "@/context/user-context";

const ADMIN_ROLES = ["app_superadmin", "app_admin"];
const MANAGER_ROLES = ["organization_owner", "organization_admin"];

export function useFaPermission() {
  const { tokenPayload } = useUser();
  const permissions = tokenPayload?.permissions ?? [];
  const role = tokenPayload?.role ?? "";
  const roleLower = role.toLowerCase();

  const isAdmin = ADMIN_ROLES.includes(roleLower);
  const isManager = isAdmin || MANAGER_ROLES.includes(roleLower);

  const hasAnyPermission = (names: string[]): boolean => {
    if (isAdmin) return true;
    return permissions.some((p) => names.includes(p.name));
  };

  const hasPermission = (name: string): boolean => hasAnyPermission([name]);

  return {
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
