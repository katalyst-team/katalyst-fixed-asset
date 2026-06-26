import type { FaCheckOutFilterOptions, FaCheckOutRecord } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetCheckOutsResponse = ApiResponse<{ checkOuts: FaCheckOutRecord[] }>;

interface GetCheckOutsParams extends FaCheckOutFilterOptions {
  organizationId: string;
}

export const getCheckOutsService = async ({
  limit,
  organizationId,
  page,
  status,
}: GetCheckOutsParams): Promise<GetCheckOutsResponse> => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/check-outs${queryString}`,
  });
};
