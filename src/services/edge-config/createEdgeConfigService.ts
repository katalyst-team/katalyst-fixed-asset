import { CreateEdgeConfigPayload, EdgeConfigMutationResponse } from "@/types/edge-config";

import type { ApiResponse } from "..";
import fetcher from "..";

interface CreateEdgeConfigParams {
  organizationId: string;
  payload: CreateEdgeConfigPayload;
}

export const createEdgeConfigService = async ({
  organizationId,
  payload,
}: CreateEdgeConfigParams): Promise<ApiResponse<EdgeConfigMutationResponse>> => {
  return fetcher({
    data: payload,
    method: "POST",
    url: `/v1/organizations/${organizationId}/edge-config`,
  });
};
