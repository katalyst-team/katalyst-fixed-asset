import type { FaAsset } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type UpdateAssetResponse = ApiResponse<{ asset: FaAsset }>;

interface UpdateAssetParams {
  assetId: string;
  data: Partial<FaAsset>;
  organizationId: string;
}

export const updateAssetService = async ({
  assetId,
  data,
  organizationId,
}: UpdateAssetParams): Promise<UpdateAssetResponse> => {
  return fetcher({
    data,
    method: "PUT",
    url: `/v1/organizations/${organizationId}/fa/assets/${assetId}`,
  });
};
