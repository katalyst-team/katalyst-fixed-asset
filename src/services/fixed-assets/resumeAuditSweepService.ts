import fetcher, { ApiResponse } from "..";

export type ResumeAuditSweepResponse = ApiResponse<Record<string, unknown>>;

interface ResumeAuditSweepParams {
  auditId: string;
  data: { zone_id: string };
  organizationId: string;
}

export const resumeAuditSweepService = async ({
  auditId,
  data,
  organizationId,
}: ResumeAuditSweepParams): Promise<ResumeAuditSweepResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/audit/${auditId}/resume-sweep`,
  });
};
