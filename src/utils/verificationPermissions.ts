import { GetAccountsResponse } from "@/services/auth/getAccountsService";

export const VERIFY_REJECT_PERMISSIONS = new Set([
  "ORGANIZATION_CREATE_ALL",
  "ORGANIZATION_DELETE_ALL",
  "ORGANIZATION_OWNER",
  "ORGANIZATION_UPDATE_ALL",
  "VERIFICATION_STOCK_MOVEMENT_REJECT",
  "VERIFICATION_STOCK_MOVEMENT_VERIFY",
]);

export const checkCanVerifyReject = (
  user: GetAccountsResponse | null,
): boolean => {
  if (!user) return false;
  const { permissions, role } = user.data;
  if (role && VERIFY_REJECT_PERMISSIONS.has(role.name)) return true;
  return permissions?.some((p) => VERIFY_REJECT_PERMISSIONS.has(p.name)) ?? false;
};
