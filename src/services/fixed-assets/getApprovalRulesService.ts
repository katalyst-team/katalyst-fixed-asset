import type { FaApprovalRule } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetApprovalRulesResponse = ApiResponse<{
  rules: FaApprovalRule[];
}>;

interface GetApprovalRulesParams {
  organizationId: string;
}

export const getApprovalRulesService = async ({
  organizationId,
}: GetApprovalRulesParams): Promise<GetApprovalRulesResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/approvals/rules`,
  });
};
