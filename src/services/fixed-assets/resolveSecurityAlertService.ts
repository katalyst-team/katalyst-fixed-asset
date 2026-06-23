import fetcher, { ApiResponse } from "..";

export type ResolveSecurityAlertResponse = ApiResponse<Record<string, unknown>>;

interface ResolveSecurityAlertParams {
  alertId: string;
  data: { resolution_notes: string };
  organizationId: string;
}

export const resolveSecurityAlertService = async ({
  alertId,
  data,
  organizationId,
}: ResolveSecurityAlertParams): Promise<ResolveSecurityAlertResponse> => {
  return fetcher({
    data,
    method: "PUT",
    url: `/v1/organizations/${organizationId}/fa/security/alerts/${alertId}/resolve`,
  });
};
