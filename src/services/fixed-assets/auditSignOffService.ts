import type { AuditSignOffRequest } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type AuditSignOffResponse = ApiResponse<{
  remaining_signoffs: number;
  signed: boolean;
}>;

interface AuditSignOffParams {
  auditId: string;
  data: AuditSignOffRequest;
  organizationId: string;
}

export const auditSignOffService = async ({
  auditId,
  data,
  organizationId,
}: AuditSignOffParams): Promise<AuditSignOffResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/audit/${auditId}/sign-off`,
  });
};
