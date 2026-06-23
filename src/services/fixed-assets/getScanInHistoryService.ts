import type { FaScanInHistoryItem } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetScanInHistoryResponse = ApiResponse<{
  history: FaScanInHistoryItem[];
}>;

interface GetScanInHistoryParams {
  cursor?: string;
  limit?: number;
  organizationId: string;
}

export const getScanInHistoryService = async ({
  cursor,
  limit,
  organizationId,
}: GetScanInHistoryParams): Promise<GetScanInHistoryResponse> => {
  const params = new URLSearchParams();
  if (cursor) params.append("cursor", cursor);
  if (limit) params.append("limit", limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/scan-in/history${queryString}`,
  });
};
