import fetcher, { ApiResponse } from "..";
import type { InsurancePolicyPayload } from "./createInsurancePolicyService";

export type UpdateInsurancePolicyPayload = Partial<
  InsurancePolicyPayload & { status: string }
>;

export type UpdateInsurancePolicyResponse = ApiResponse<{ ext_id: string }>;

interface UpdateInsurancePolicyParams {
  data: UpdateInsurancePolicyPayload;
  organizationId: string;
  policyId: string;
}

export const updateInsurancePolicyService = async ({
  data,
  organizationId,
  policyId,
}: UpdateInsurancePolicyParams): Promise<UpdateInsurancePolicyResponse> => {
  return fetcher({
    data,
    method: "PUT",
    url: `/v1/organizations/${organizationId}/fa/finance/insurance/${policyId}`,
  });
};
