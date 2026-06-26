import type { FaScanInHistoryItem } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetScanInHistoryResponse = ApiResponse<{
  history: FaScanInHistoryItem[];
}>;

interface GetScanInHistoryParams {
  limit?: number;
  organizationId: string;
  page?: number;
}

export const getScanInHistoryService = async ({
  limit,
  organizationId,
  page,
}: GetScanInHistoryParams): Promise<GetScanInHistoryResponse> => {
  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/scan-in/history${queryString}`,
  });
};
