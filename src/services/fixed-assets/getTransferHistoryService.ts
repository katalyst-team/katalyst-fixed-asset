import type { FaTransferHistoryItem } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetTransferHistoryResponse = ApiResponse<{
  history: FaTransferHistoryItem[];
}>;

interface GetTransferHistoryParams {
  limit?: number;
  organizationId: string;
  page?: number;
}

export const getTransferHistoryService = async ({
  limit,
  organizationId,
  page,
}: GetTransferHistoryParams): Promise<GetTransferHistoryResponse> => {
  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/transfers/history${queryString}`,
  });
};
