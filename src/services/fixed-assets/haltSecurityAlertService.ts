import type { FaSecurityAlert } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type HaltSecurityAlertResponse = ApiResponse<{
  alert: FaSecurityAlert;
  paged: boolean;
}>;

interface HaltSecurityAlertParams {
  alertId: string;
  organizationId: string;
}

export const haltSecurityAlertService = async ({
  alertId,
  organizationId,
}: HaltSecurityAlertParams): Promise<HaltSecurityAlertResponse> => {
  return fetcher({
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/security/alerts/${alertId}/halt`,
  });
};
