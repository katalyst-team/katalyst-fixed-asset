import type { FaCheckOutFilterOptions, FaCheckOutRecord } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetCheckOutsResponse = ApiResponse<{ checkOuts: FaCheckOutRecord[] }>;

interface GetCheckOutsParams extends FaCheckOutFilterOptions {
  organizationId: string;
}

export const getCheckOutsService = async ({
  cursor,
  limit,
  organizationId,
  status,
}: GetCheckOutsParams): Promise<GetCheckOutsResponse> => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (cursor) params.append("cursor", cursor);
  if (limit) params.append("limit", limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/check-outs${queryString}`,
  });
};
