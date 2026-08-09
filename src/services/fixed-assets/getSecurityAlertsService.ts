import type {
  FaSecurityAlert,
  FaSecurityAlertFilterOptions,
} from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetSecurityAlertsResponse = ApiResponse<{
  alerts: FaSecurityAlert[];
  summary?: {
    critical: number;
    investigating: number;
    resolution_rate: number;
    total: number;
  };
}>;

interface GetSecurityAlertsParams extends FaSecurityAlertFilterOptions {
  organizationId: string;
}

export const getSecurityAlertsService = async ({
  limit,
  organizationId,
  page,
  severity,
  status,
}: GetSecurityAlertsParams): Promise<GetSecurityAlertsResponse> => {
  const params = new URLSearchParams();
  if (severity) params.append("severity", severity);
  if (status) params.append("status", status);
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/security/alerts${queryString}`,
  });
};
