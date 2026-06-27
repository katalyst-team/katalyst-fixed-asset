import type { ApprovalScope, ApprovalType, FaApprovalRule } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export interface CreateApprovalRuleRequest {
  approval_type: ApprovalType;
  conditions?: Record<string, unknown>;
  name: string;
  priority?: number;
  scope: ApprovalScope;
  scope_value?: string | null;
  workflow_steps: Record<string, unknown>[];
}

export type CreateApprovalRuleResponse = ApiResponse<FaApprovalRule>;

interface CreateApprovalRuleParams {
  data: CreateApprovalRuleRequest;
  organizationId: string;
}

export const createApprovalRuleService = async ({
  data,
  organizationId,
}: CreateApprovalRuleParams): Promise<CreateApprovalRuleResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/approvals/rules`,
  });
};
