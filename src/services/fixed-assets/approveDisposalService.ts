import type { FaDisposalItem } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type ApproveDisposalResponse = ApiResponse<{
  disposal: FaDisposalItem;
  journal_entry_id?: string;
  next_stage: string;
}>;

interface ApproveDisposalParams {
  disposalId: string;
  organizationId: string;
}

export const approveDisposalService = async ({
  disposalId,
  organizationId,
}: ApproveDisposalParams): Promise<ApproveDisposalResponse> => {
  return fetcher({
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/disposals/${disposalId}/approve`,
  });
};
