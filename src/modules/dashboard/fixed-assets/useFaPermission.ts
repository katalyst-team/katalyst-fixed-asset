import { useUser } from "@/context/user-context";

export function useFaPermission() {
  const { tokenPayload } = useUser();
  const permissions = tokenPayload?.permissions ?? [];
  const role = tokenPayload?.role ?? "";
  const isAdmin = role.toLowerCase() === "admin";
  const isManager =
    isAdmin || role.toLowerCase().includes("manager");

  const hasPermission = (name: string): boolean => {
    if (isAdmin) return true;
    return permissions.some((p) => p.name === name);
  };

  const hasAnyPermission = (names: string[]): boolean => {
    if (isAdmin) return true;
    return names.some((n) => permissions.some((p) => p.name === n));
  };

  return {
    canDelete: isManager || hasAnyPermission(["delete", "fa.delete", "fa dispose"]),
    canManage: isManager,
    canManageSettings: isAdmin || hasAnyPermission(["settings", "fa.settings"]),
    canManageUsers: hasAnyPermission(["user management", "fa.users.manage", "invite user"]),
    hasAnyPermission,
    hasPermission,
    isAdmin,
    isManager,
    permissions,
    role,
  };
}
