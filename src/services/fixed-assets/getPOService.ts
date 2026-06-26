import type { FaPO, FaPOFilterOptions } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetPOResponse = ApiResponse<{ purchase_orders: FaPO[] }>;

interface GetPOParams extends FaPOFilterOptions {
  organizationId: string;
}

export const getPOService = async ({
  limit,
  organizationId,
  page,
  status,
}: GetPOParams): Promise<GetPOResponse> => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/po${queryString}`,
  });
};
