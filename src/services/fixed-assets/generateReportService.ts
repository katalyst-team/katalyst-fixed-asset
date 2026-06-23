import type { FaReportResult, GenerateReportRequest } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GenerateReportResponse = ApiResponse<FaReportResult>;

interface GenerateReportParams {
  data: GenerateReportRequest;
  organizationId: string;
}

export const generateReportService = async ({
  data,
  organizationId,
}: GenerateReportParams): Promise<GenerateReportResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/reports/generate`,
  });
};
