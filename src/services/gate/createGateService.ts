import { CreateGatePayload, GateMutationResponse } from "@/types/gate";

import fetcher, { ApiResponse } from "..";

interface CreateGateParams {
  organizationId: string;
  payload: CreateGatePayload;
}

export const createGateService = async ({
  organizationId,
  payload,
}: CreateGateParams): Promise<ApiResponse<GateMutationResponse>> => {
  return fetcher({
    data: payload,
    method: "POST",
    url: `/v1/organizations/${organizationId}/gates`,
  });
};
