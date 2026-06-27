import fetcher from "..";
import type { ApprovalActionResponse } from "./approveRequestService";

export type WithdrawRequestResponse = ApprovalActionResponse;

interface WithdrawRequestParams {
  comment?: string;
  organizationId: string;
  requestId: string;
}

export const withdrawRequestService = async ({
  comment,
  organizationId,
  requestId,
}: WithdrawRequestParams): Promise<WithdrawRequestResponse> => {
  return fetcher({
    data: { comment },
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/approvals/${requestId}/withdraw`,
  });
};
