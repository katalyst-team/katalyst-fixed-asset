import type { FaAssetDetail } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetAssetDetailResponse = ApiResponse<{ asset: FaAssetDetail | null }>;

interface GetAssetDetailParams {
  assetId: string;
  organizationId: string;
}

export const getAssetDetailService = async ({
  assetId,
  organizationId,
}: GetAssetDetailParams): Promise<GetAssetDetailResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/assets/${assetId}`,
  });
};
