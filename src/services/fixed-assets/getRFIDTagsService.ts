import type { FaRfidTag, FaRfidTagFilterOptions } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetRFIDTagsResponse = ApiResponse<{ tags: FaRfidTag[] }>;

interface GetRFIDTagsParams extends FaRfidTagFilterOptions {
  organizationId: string;
}

export const getRFIDTagsService = async ({
  asset_id,
  limit,
  organizationId,
  page,
  q,
  status,
}: GetRFIDTagsParams): Promise<GetRFIDTagsResponse> => {
  const params = new URLSearchParams();
  if (q) params.append("q", q);
  if (status) params.append("status", status);
  if (asset_id) params.append("asset_id", asset_id);
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/rfid-tags${queryString}`,
  });
};
