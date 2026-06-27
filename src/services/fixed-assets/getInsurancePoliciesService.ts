import type { FaInsurancePolicy } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetInsurancePoliciesResponse = ApiResponse<{
  policies: FaInsurancePolicy[];
}>;

interface GetInsurancePoliciesParams {
  limit?: number;
  organizationId: string;
  page?: number;
  q?: string;
  status?: string;
}

export const getInsurancePoliciesService = async ({
  limit,
  organizationId,
  page,
  q,
  status,
}: GetInsurancePoliciesParams): Promise<GetInsurancePoliciesResponse> => {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  const qs = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/finance/insurance${qs}`,
  });
};
