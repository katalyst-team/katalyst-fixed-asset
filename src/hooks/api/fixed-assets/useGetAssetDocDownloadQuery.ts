import { useQuery } from "@tanstack/react-query";

import {
  GetAssetDocDownloadResponse,
  getAssetDocDownloadService,
} from "@/services/fixed-assets/getAssetDocDownloadService";

interface UseGetAssetDocDownloadQueryParams {
  assetId: string;
  docId: string;
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_ASSET_DOC_DOWNLOAD = (
  organizationId: string,
  assetId: string,
  docId: string,
) => ["faAssetDocDownload", organizationId, assetId, docId];

const useGetAssetDocDownloadQuery = ({
  assetId,
  docId,
  enabled = true,
  organizationId,
}: UseGetAssetDocDownloadQueryParams) => {
  return useQuery<GetAssetDocDownloadResponse, Error>({
    enabled: Boolean(organizationId && assetId && docId && enabled),
    queryFn: () => getAssetDocDownloadService({ assetId, docId, organizationId }),
    queryKey: KEY_USE_GET_FA_ASSET_DOC_DOWNLOAD(organizationId, assetId, docId),
    staleTime: 60 * 1000,
  });
};

export default useGetAssetDocDownloadQuery;
