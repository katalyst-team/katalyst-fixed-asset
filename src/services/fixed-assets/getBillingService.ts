import type { FaBilling } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetBillingResponse = ApiResponse<FaBilling>;

interface GetBillingParams {
  organizationId: string;
}

export const getBillingService = async ({
  organizationId,
}: GetBillingParams): Promise<GetBillingResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/billing`,
  });
};
