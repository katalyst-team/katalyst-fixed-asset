import type { FaAssetDocDownload } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetAssetDocDownloadResponse = ApiResponse<FaAssetDocDownload>;

interface GetAssetDocDownloadParams {
  assetId: string;
  docId: string;
  organizationId: string;
}

export const getAssetDocDownloadService = async ({
  assetId,
  docId,
  organizationId,
}: GetAssetDocDownloadParams): Promise<GetAssetDocDownloadResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/assets/${assetId}/docs/${docId}`,
  });
};
