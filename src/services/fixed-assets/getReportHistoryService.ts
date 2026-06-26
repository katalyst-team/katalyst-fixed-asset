import type { FaReportHistoryItem } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetReportHistoryResponse = ApiResponse<{
  reports: FaReportHistoryItem[];
}>;

interface GetReportHistoryParams {
  limit?: number;
  organizationId: string;
  page?: number;
}

export const getReportHistoryService = async ({
  limit,
  organizationId,
  page,
}: GetReportHistoryParams): Promise<GetReportHistoryResponse> => {
  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/reports/history${queryString}`,
  });
};
