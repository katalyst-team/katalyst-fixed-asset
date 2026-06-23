import type { FaTransferFilterOptions, FaTransferItem } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetTransfersResponse = ApiResponse<{ transfers: FaTransferItem[] }>;

interface GetTransfersParams extends FaTransferFilterOptions {
  organizationId: string;
}

export const getTransfersService = async ({
  cursor,
  limit,
  organizationId,
  status,
}: GetTransfersParams): Promise<GetTransfersResponse> => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (cursor) params.append("cursor", cursor);
  if (limit) params.append("limit", limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/transfers${queryString}`,
  });
};
