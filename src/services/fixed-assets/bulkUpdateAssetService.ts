import type { BulkUpdateAssetRequest } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type BulkUpdateAssetResponse = ApiResponse<{
  asset_ids: string[];
  updated_count: number;
}>;

interface BulkUpdateAssetParams {
  data: BulkUpdateAssetRequest;
  organizationId: string;
}

export const bulkUpdateAssetService = async ({
  data,
  organizationId,
}: BulkUpdateAssetParams): Promise<BulkUpdateAssetResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/assets/bulk-update`,
  });
};
