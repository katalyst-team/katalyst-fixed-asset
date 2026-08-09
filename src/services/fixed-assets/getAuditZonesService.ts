import type { FaAuditProgress, FaAuditSession, FaAuditZone } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetAuditZonesResponse = ApiResponse<{
  audit_progress?: FaAuditProgress;
  audit_session?: FaAuditSession;
  zones: FaAuditZone[];
}>;

interface GetAuditZonesParams {
  auditId?: string;
  organizationId: string;
}

export const getAuditZonesService = async ({
  auditId,
  organizationId,
}: GetAuditZonesParams): Promise<GetAuditZonesResponse> => {
  const queryString = auditId ? `?audit_id=${auditId}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/audit/zones${queryString}`,
  });
};
