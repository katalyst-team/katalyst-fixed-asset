import type { CreateDisposalRequest, FaDisposalItem } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type CreateDisposalResponse = ApiResponse<{ disposal: FaDisposalItem }>;

interface CreateDisposalParams {
  data: CreateDisposalRequest;
  organizationId: string;
}

export const createDisposalService = async ({
  data,
  organizationId,
}: CreateDisposalParams): Promise<CreateDisposalResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/disposals`,
  });
};
