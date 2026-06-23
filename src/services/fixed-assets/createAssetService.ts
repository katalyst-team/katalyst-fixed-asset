import type { CreateAssetRequest, FaAsset } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type CreateAssetResponse = ApiResponse<{ asset: FaAsset }>;

interface CreateAssetParams {
  data: CreateAssetRequest;
  organizationId: string;
}

export const createAssetService = async ({
  data,
  organizationId,
}: CreateAssetParams): Promise<CreateAssetResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/assets`,
  });
};
