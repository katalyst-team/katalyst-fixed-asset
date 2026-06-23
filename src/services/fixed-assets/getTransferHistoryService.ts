import type { FaTransferHistoryItem } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetTransferHistoryResponse = ApiResponse<{
  history: FaTransferHistoryItem[];
}>;

interface GetTransferHistoryParams {
  cursor?: string;
  limit?: number;
  organizationId: string;
}

export const getTransferHistoryService = async ({
  cursor,
  limit,
  organizationId,
}: GetTransferHistoryParams): Promise<GetTransferHistoryResponse> => {
  const params = new URLSearchParams();
  if (cursor) params.append("cursor", cursor);
  if (limit) params.append("limit", limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/transfers/history${queryString}`,
  });
};
