import type {
  FaSecurityAlert,
  FaSecurityAlertFilterOptions,
} from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetSecurityAlertsResponse = ApiResponse<{
  alerts: FaSecurityAlert[];
}>;

interface GetSecurityAlertsParams extends FaSecurityAlertFilterOptions {
  organizationId: string;
}

export const getSecurityAlertsService = async ({
  cursor,
  limit,
  organizationId,
  severity,
  status,
}: GetSecurityAlertsParams): Promise<GetSecurityAlertsResponse> => {
  const params = new URLSearchParams();
  if (severity) params.append("severity", severity);
  if (status) params.append("status", status);
  if (cursor) params.append("cursor", cursor);
  if (limit) params.append("limit", limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/security/alerts${queryString}`,
  });
};
