import type { FaTransferFilterOptions, FaTransferItem } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetTransfersResponse = ApiResponse<{ transfers: FaTransferItem[] }>;

interface GetTransfersParams extends FaTransferFilterOptions {
  organizationId: string;
}

export const getTransfersService = async ({
  limit,
  organizationId,
  page,
  status,
}: GetTransfersParams): Promise<GetTransfersResponse> => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/transfers${queryString}`,
  });
};
