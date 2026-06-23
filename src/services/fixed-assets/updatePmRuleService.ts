import type { CreatePmRuleRequest } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type UpdatePmRuleResponse = ApiResponse<Record<string, unknown>>;

interface UpdatePmRuleParams {
  data: Partial<CreatePmRuleRequest>;
  organizationId: string;
  pmRuleId: string;
}

export const updatePmRuleService = async ({
  data,
  organizationId,
  pmRuleId,
}: UpdatePmRuleParams): Promise<UpdatePmRuleResponse> => {
  return fetcher({
    data,
    method: "PUT",
    url: `/v1/organizations/${organizationId}/fa/pm-rules/${pmRuleId}`,
  });
};
