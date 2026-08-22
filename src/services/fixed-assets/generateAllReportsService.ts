import type { FaReportFormat, FaReportResult } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GenerateAllReportsResponse = ApiResponse<FaReportResult[]>;

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
