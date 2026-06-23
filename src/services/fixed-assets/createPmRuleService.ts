import type { CreatePmRuleRequest } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type CreatePmRuleResponse = ApiResponse<Record<string, unknown>>;

interface CreatePmRuleParams {
  data: CreatePmRuleRequest;
  organizationId: string;
}

export const createPmRuleService = async ({
  data,
  organizationId,
}: CreatePmRuleParams): Promise<CreatePmRuleResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/pm-rules`,
  });
};
