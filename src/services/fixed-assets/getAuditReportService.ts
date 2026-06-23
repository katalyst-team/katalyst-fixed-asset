import fetcher, { ApiResponse } from "..";

export type GetAuditReportResponse = ApiResponse<{ download_url: string }>;

interface GetAuditReportParams {
  auditId: string;
  organizationId: string;
}

export const getAuditReportService = async ({
  auditId,
  organizationId,
}: GetAuditReportParams): Promise<GetAuditReportResponse> => {
  return fetcher({
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/audit/${auditId}/report`,
  });
};
