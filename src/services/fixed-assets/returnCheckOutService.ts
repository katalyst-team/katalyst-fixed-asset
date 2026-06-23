import type { FaCheckOutRecord, ReturnCheckOutRequest } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type ReturnCheckOutResponse = ApiResponse<{ checkOut: FaCheckOutRecord }>;

interface ReturnCheckOutParams {
  checkOutId: string;
  data: ReturnCheckOutRequest;
  organizationId: string;
}

export const returnCheckOutService = async ({
  checkOutId,
  data,
  organizationId,
}: ReturnCheckOutParams): Promise<ReturnCheckOutResponse> => {
  return fetcher({
    data,
    method: "PUT",
    url: `/v1/organizations/${organizationId}/fa/check-outs/${checkOutId}/return`,
  });
};
