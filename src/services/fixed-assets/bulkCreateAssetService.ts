import type { BulkCreateAssetRequest, FaAsset } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type BulkCreateAssetResponse = ApiResponse<{
  assets: FaAsset[];
  created_count: number;
}>;

interface BulkCreateAssetParams {
  data: BulkCreateAssetRequest;
  organizationId: string;
}

export const bulkCreateAssetService = async ({
  data,
  organizationId,
}: BulkCreateAssetParams): Promise<BulkCreateAssetResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/assets/bulk`,
  });
};
