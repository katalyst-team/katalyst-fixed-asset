import type { FaReportTemplate } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetReportTemplatesResponse = ApiResponse<{
  templates: FaReportTemplate[];
}>;

interface GetReportTemplatesParams {
  organizationId: string;
}

export const getReportTemplatesService = async ({
  organizationId,
}: GetReportTemplatesParams): Promise<GetReportTemplatesResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/reports/templates`,
  });
};
