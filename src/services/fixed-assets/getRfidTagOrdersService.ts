import type { FaRfidTagOrder, FaRfidTagOrderFilterOptions } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetRfidTagOrdersResponse = ApiResponse<{ orders: FaRfidTagOrder[] }>;

interface GetRfidTagOrdersParams extends FaRfidTagOrderFilterOptions {
  organizationId: string;
}

export const getRfidTagOrdersService = async ({
  limit,
  organizationId,
  page,
  status,
}: GetRfidTagOrdersParams): Promise<GetRfidTagOrdersResponse> => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/rfid-tags/orders${queryString}`,
  });
};
