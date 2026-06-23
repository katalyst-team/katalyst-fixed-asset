import type { FaReportPreview } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetReportPreviewResponse = ApiResponse<FaReportPreview>;

interface GetReportPreviewParams {
  organizationId: string;
  reportId: string;
}

export const getReportPreviewService = async ({
  organizationId,
  reportId,
}: GetReportPreviewParams): Promise<GetReportPreviewResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/reports/${reportId}/preview`,
  });
};
