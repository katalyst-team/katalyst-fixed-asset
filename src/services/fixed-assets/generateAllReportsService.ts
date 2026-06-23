import type { FaReportFormat } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GenerateAllReportsResponse = ApiResponse<{
  report_ids: string[];
  status: string;
}>;

interface GenerateAllReportsParams {
  data: { format: FaReportFormat };
  organizationId: string;
}

export const generateAllReportsService = async ({
  data,
  organizationId,
}: GenerateAllReportsParams): Promise<GenerateAllReportsResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/reports/generate-all`,
  });
};
