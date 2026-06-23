import type { CreateCheckOutRequest, FaCheckOutRecord } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type CreateCheckOutResponse = ApiResponse<{ checkOut: FaCheckOutRecord }>;

interface CreateCheckOutParams {
  data: CreateCheckOutRequest;
  organizationId: string;
}

export const createCheckOutService = async ({
  data,
  organizationId,
}: CreateCheckOutParams): Promise<CreateCheckOutResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/check-outs`,
  });
};
