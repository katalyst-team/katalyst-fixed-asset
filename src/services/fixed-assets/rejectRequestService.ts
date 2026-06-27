import fetcher from "..";
import type { ApprovalActionResponse } from "./approveRequestService";

export type RejectRequestResponse = ApprovalActionResponse;

interface RejectRequestParams {
  organizationId: string;
  reason: string;
  requestId: string;
}

export const rejectRequestService = async ({
  organizationId,
  reason,
  requestId,
}: RejectRequestParams): Promise<RejectRequestResponse> => {
  return fetcher({
    data: { reason },
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/approvals/${requestId}/reject`,
  });
};
