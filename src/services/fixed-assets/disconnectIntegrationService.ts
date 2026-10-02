import fetcher, { ApiResponse } from "..";

export type DisconnectIntegrationResponse = ApiResponse<{ connected: boolean }>;

interface DisconnectIntegrationParams {
  organizationId: string;
  type: "erp" | "active-directory" | "email";
}

export const disconnectIntegrationService = async ({
  organizationId,
  type,
}: DisconnectIntegrationParams): Promise<DisconnectIntegrationResponse> => {
  return fetcher({
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/integrations/${type}/disconnect`,
  });
};
