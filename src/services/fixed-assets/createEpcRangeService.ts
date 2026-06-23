import type { CreateEpcRangeRequest, FaEpcRange } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type CreateEpcRangeResponse = ApiResponse<{ range: FaEpcRange }>;

interface CreateEpcRangeParams {
  data: CreateEpcRangeRequest;
  organizationId: string;
}

export const createEpcRangeService = async ({
  data,
  organizationId,
}: CreateEpcRangeParams): Promise<CreateEpcRangeResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/epc-ranges`,
  });
};
