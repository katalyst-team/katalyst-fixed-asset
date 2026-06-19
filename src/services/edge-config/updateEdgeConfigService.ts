import { EdgeConfigMutationResponse, UpdateEdgeConfigPayload } from "@/types/edge-config";

import type { ApiResponse } from "..";
import fetcher from "..";

interface UpdateEdgeConfigParams {
  edgeConfigId: string;
  organizationId: string;
  payload: UpdateEdgeConfigPayload;
}

export const updateEdgeConfigService = async ({
  edgeConfigId,
  organizationId,
  payload,
}: UpdateEdgeConfigParams): Promise<ApiResponse<EdgeConfigMutationResponse>> => {
  return fetcher({
    data: payload,
    method: "PATCH",
    url: `/v1/organizations/${organizationId}/edge-config/${edgeConfigId}`,
  });
};
