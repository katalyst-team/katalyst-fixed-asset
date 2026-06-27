import type { FaApprovalRule } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export interface UpdateApprovalRuleRequest {
  conditions?: Record<string, unknown>;
  is_active?: boolean;
  name?: string;
  priority?: number;
  scope_value?: string | null;
  workflow_steps?: Record<string, unknown>[];
}

export type UpdateApprovalRuleResponse = ApiResponse<FaApprovalRule>;

interface UpdateApprovalRuleParams {
  data: UpdateApprovalRuleRequest;
  organizationId: string;
  ruleId: string;
}

export const updateApprovalRuleService = async ({
  data,
  organizationId,
  ruleId,
}: UpdateApprovalRuleParams): Promise<UpdateApprovalRuleResponse> => {
  return fetcher({
    data,
    method: "PUT",
    url: `/v1/organizations/${organizationId}/fa/approvals/rules/${ruleId}`,
  });
};
