import { EdgeConfigMutationResponse } from "@/types/edge-config";

import type { ApiResponse } from "..";
import fetcher from "..";

interface DeleteEdgeConfigParams {
  edgeConfigId: string;
  organizationId: string;
}

export const deleteEdgeConfigService = async ({
  edgeConfigId,
  organizationId,
}: DeleteEdgeConfigParams): Promise<ApiResponse<EdgeConfigMutationResponse>> => {
  return fetcher({
    method: "DELETE",
    url: `/v1/organizations/${organizationId}/edge-config/${edgeConfigId}`,
  });
};
