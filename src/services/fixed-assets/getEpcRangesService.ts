import type { FaEpcRange } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetEpcRangesResponse = ApiResponse<{
  ranges: FaEpcRange[];
}>;

interface GetEpcRangesParams {
  organizationId: string;
}

export const getEpcRangesService = async ({
  organizationId,
}: GetEpcRangesParams): Promise<GetEpcRangesResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/epc-ranges`,
  });
};
