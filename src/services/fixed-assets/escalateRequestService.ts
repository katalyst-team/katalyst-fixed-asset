import fetcher from "..";
import type { ApprovalActionResponse } from "./approveRequestService";

export type EscalateRequestResponse = ApprovalActionResponse;

interface EscalateRequestParams {
  escalateToId: string;
  organizationId: string;
  reason: string;
  requestId: string;
}

export const escalateRequestService = async ({
  escalateToId,
  organizationId,
  reason,
  requestId,
}: EscalateRequestParams): Promise<EscalateRequestResponse> => {
  return fetcher({
    data: { escalate_to_id: escalateToId, reason },
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/approvals/${requestId}/escalate`,
  });
};
