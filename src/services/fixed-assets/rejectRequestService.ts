import type { FaApprovalRequest } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type RejectRequestResponse = ApiResponse<{
  request: FaApprovalRequest;
}>;

interface RejectRequestParams {
  comment?: string;
  organizationId: string;
  requestId: string;
}

export const rejectRequestService = async ({
  comment,
  organizationId,
  requestId,
}: RejectRequestParams): Promise<RejectRequestResponse> => {
  return fetcher({
    data: { comment },
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/approvals/${requestId}/reject`,
  });
};
