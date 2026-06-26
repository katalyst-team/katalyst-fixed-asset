import type { FaInsurancePolicy } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetInsurancePoliciesResponse = ApiResponse<{
  policies: FaInsurancePolicy[];
}>;

interface GetInsurancePoliciesParams {
  organizationId: string;
}

export const getInsurancePoliciesService = async ({
  organizationId,
}: GetInsurancePoliciesParams): Promise<GetInsurancePoliciesResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/finance/insurance`,
  });
};
