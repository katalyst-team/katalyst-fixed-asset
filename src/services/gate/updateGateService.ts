import { GateMutationResponse, UpdateGatePayload } from "@/types/gate";

import fetcher, { ApiResponse } from "..";

interface UpdateGateParams {
  gateId: string;
  organizationId: string;
  payload: UpdateGatePayload;
}

export const updateGateService = async ({
  gateId,
  organizationId,
  payload,
}: UpdateGateParams): Promise<ApiResponse<GateMutationResponse>> => {
  return fetcher({
    data: payload,
    method: "PATCH",
    url: `/v1/organizations/${organizationId}/gates/${gateId}`,
  });
};
