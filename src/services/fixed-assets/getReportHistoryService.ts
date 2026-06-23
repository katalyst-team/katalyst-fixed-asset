import type { FaReportHistoryItem } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetReportHistoryResponse = ApiResponse<{
  reports: FaReportHistoryItem[];
}>;

interface GetReportHistoryParams {
  cursor?: string;
  limit?: number;
  organizationId: string;
}

export const getReportHistoryService = async ({
  cursor,
  limit,
  organizationId,
}: GetReportHistoryParams): Promise<GetReportHistoryResponse> => {
  const params = new URLSearchParams();
  if (cursor) params.append("cursor", cursor);
  if (limit) params.append("limit", limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/reports/history${queryString}`,
  });
};
