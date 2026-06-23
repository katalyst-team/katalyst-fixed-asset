import fetcher, { ApiResponse } from "..";

export type ConnectIntegrationResponse = ApiResponse<{ connected: boolean }>;

interface ConnectIntegrationParams {
  data: Record<string, unknown>;
  organizationId: string;
  type: "erp" | "active-directory" | "email";
}

export const connectIntegrationService = async ({
  data,
  organizationId,
  type,
}: ConnectIntegrationParams): Promise<ConnectIntegrationResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/integrations/${type}/connect`,
  });
};
