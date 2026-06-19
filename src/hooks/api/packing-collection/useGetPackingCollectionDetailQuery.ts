import { useQuery } from "@tanstack/react-query";

import { getPackingCollectionDetailService } from "@/services/packing-collection/getPackingCollectionDetailService";
import { PackingCollectionDetailResponse } from "@/types/packing-collection";

interface UseGetPackingCollectionDetailQueryParams {
  organizationId: string;
  packingCollectionId: string;
  enabled?: boolean;
}

export const KEY_USE_GET_PACKING_COLLECTION_DETAIL = (
  organizationId: string,
  packingCollectionId: string
) => ["packingCollectionDetail", organizationId, packingCollectionId];

const useGetPackingCollectionDetailQuery = ({
  organizationId,
  packingCollectionId,
  enabled = true,
}: UseGetPackingCollectionDetailQueryParams) => {
  return useQuery<PackingCollectionDetailResponse, Error>({
    enabled: Boolean(organizationId) && Boolean(packingCollectionId) && enabled,
    queryFn: () => getPackingCollectionDetailService({ organizationId, packingCollectionId }),
    queryKey: KEY_USE_GET_PACKING_COLLECTION_DETAIL(organizationId, packingCollectionId),
    staleTime: 60 * 1000,
  });
};

export default useGetPackingCollectionDetailQuery;