import { useUser } from "@/context/user-context";
import { GetAccountsResponse } from "@/services/auth/getAccountsService";

const SUPERADMIN_NAMES = new Set(["APP_ADMIN", "APP_SUPERADMIN", "ORGANIZATION_OWNER"]);

function checkAny(user: GetAccountsResponse | null, names: string[]): boolean {
  if (!user?.data) return false;
  const { permissions, role } = user.data;
  if (role && (SUPERADMIN_NAMES.has(role.name) || names.includes(role.name))) return true;
  return permissions?.some((p) => names.includes(p.name)) ?? false;
}

export function usePermissions() {
  const { user } = useUser();
  const isSuperAdmin = checkAny(user, [...SUPERADMIN_NAMES]);

  return {
    canCancelStockMovement: isSuperAdmin || checkAny(user, ["VERIFICATION_STOCK_MOVEMENT_CANCEL"]),
    canCreate: isSuperAdmin || checkAny(user, ["ORGANIZATION_CREATE_ALL"]),
    canDelete: isSuperAdmin || checkAny(user, ["ORGANIZATION_DELETE_ALL"]),
    canRejectAudit: isSuperAdmin || checkAny(user, ["VERIFICATION_AUDIT_REJECT"]),
    canRejectStockMovement: isSuperAdmin || checkAny(user, ["VERIFICATION_STOCK_MOVEMENT_REJECT"]),
    canRevokeStockMovement: isSuperAdmin || checkAny(user, ["VERIFICATION_STOCK_MOVEMENT_REVOKE"]),
    canSubmitAudit: isSuperAdmin || checkAny(user, ["VERIFICATION_AUDIT_SUBMIT"]),
    canSubmitStockMovement: isSuperAdmin || checkAny(user, ["VERIFICATION_STOCK_MOVEMENT_SUBMIT"]),
    canUpdate: isSuperAdmin || checkAny(user, ["ORGANIZATION_UPDATE_ALL"]),
    canValidateStockMovement: isSuperAdmin || checkAny(user, ["VERIFICATION_STOCK_MOVEMENT_VALIDATE"]),
    canVerifyAudit: isSuperAdmin || checkAny(user, ["VERIFICATION_AUDIT_VERIFY"]),
    canVerifyStockMovement: isSuperAdmin || checkAny(user, ["VERIFICATION_STOCK_MOVEMENT_VERIFY"]),
    canWriteVerificationConfig: isSuperAdmin || checkAny(user, ["VERIFICATION_CONFIG_WRITE"]),
    isSuperAdmin,
  };
}
