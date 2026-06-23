import { useQuery } from "@tanstack/react-query";

import {
  GetAssetDetailResponse,
  getAssetDetailService,
} from "@/services/fixed-assets/getAssetDetailService";

interface UseGetAssetDetailQueryParams {
  assetId: string;
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_ASSET_DETAIL = (
  organizationId: string,
  assetId: string,
) => ["faAssetDetail", organizationId, assetId];

const useGetAssetDetailQuery = ({
  assetId,
  enabled = true,
  organizationId,
}: UseGetAssetDetailQueryParams) => {
  return useQuery<GetAssetDetailResponse, Error>({
    enabled: Boolean(organizationId && assetId && enabled),
    queryFn: () => getAssetDetailService({ assetId, organizationId }),
    queryKey: KEY_USE_GET_FA_ASSET_DETAIL(organizationId, assetId),
    staleTime: 5 * 60 * 1000,
  });
};

export default useGetAssetDetailQuery;
