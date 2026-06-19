const NAGATECH_SYNC_ORG_ID_DEV =
  "20067e51-1fc5-488e-8366-74cfa06455fa" as const;
const NAGATECH_SYNC_ORG_ID_PROD =
  "c152c758-9ecb-4717-a3ba-311775e1f9ef" as const;

export const isNagatechSyncOrganization = (
  organizationId: string | undefined
): boolean => {
  if (!organizationId) return false;

  const isProduction = process.env.NEXT_PUBLIC_ENV === "production";
  const allowedOrgId = isProduction
    ? NAGATECH_SYNC_ORG_ID_PROD
    : NAGATECH_SYNC_ORG_ID_DEV;

  return organizationId === allowedOrgId;
};
