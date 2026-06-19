import { GateMutationResponse } from "@/types/gate";

import fetcher, { ApiResponse } from "..";

interface DeleteGateParams {
  gateId: string;
  organizationId: string;
}

export const deleteGateService = async ({
  gateId,
  organizationId,
}: DeleteGateParams): Promise<ApiResponse<GateMutationResponse>> => {
  return fetcher({
    method: "DELETE",
    url: `/v1/organizations/${organizationId}/gates/${gateId}`,
  });
};
