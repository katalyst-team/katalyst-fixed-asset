import type { PostAuditAdjustmentRequest } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type PostAuditAdjustmentResponse = ApiResponse<{
  journal_entry_id: string;
  posted: boolean;
}>;

interface PostAuditAdjustmentParams {
  auditId: string;
  data: PostAuditAdjustmentRequest;
  organizationId: string;
}

export const postAuditAdjustmentService = async ({
  auditId,
  data,
  organizationId,
}: PostAuditAdjustmentParams): Promise<PostAuditAdjustmentResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/audit/${auditId}/post-adjustment`,
  });
};
