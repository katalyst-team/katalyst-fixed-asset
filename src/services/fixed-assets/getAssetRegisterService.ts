import type { FaAsset, FaAssetFilterOptions } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetAssetRegisterResponse = ApiResponse<{ assets: FaAsset[] }>;

interface GetAssetRegisterParams extends FaAssetFilterOptions {
  organizationId: string;
}

export const getAssetRegisterService = async ({
  cat,
  cursor,
  custodian,
  limit,
  loc,
  organizationId,
  q,
  status,
  store_id,
}: GetAssetRegisterParams): Promise<GetAssetRegisterResponse> => {
  const params = new URLSearchParams();
  if (q) params.append("q", q);
  if (cat) params.append("cat", cat);
  if (status) params.append("status", status);
  if (loc) params.append("loc", loc);
  if (custodian) params.append("custodian", custodian);
  if (store_id) params.append("store_id", store_id);
  if (cursor) params.append("cursor", cursor);
  if (limit) params.append("limit", limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/assets${queryString}`,
  });
};
