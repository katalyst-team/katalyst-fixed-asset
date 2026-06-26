import type { FaApprovalRequest } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type ApproveRequestResponse = ApiResponse<{
  nextStep?: string;
  request: FaApprovalRequest;
  workflowComplete: boolean;
}>;

interface ApproveRequestParams {
  comment?: string;
  organizationId: string;
  requestId: string;
}

export const approveRequestService = async ({
  comment,
  organizationId,
  requestId,
}: ApproveRequestParams): Promise<ApproveRequestResponse> => {
  return fetcher({
    data: { comment },
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/approvals/${requestId}/approve`,
  });
};
