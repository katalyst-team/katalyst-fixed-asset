import { useQuery } from "@tanstack/react-query";

import { getPackingCollectionDataService } from "@/services/packing-collection/getPackingCollectionDataService";
import {
  PackingCollectionFilterOptions,
  PackingCollectionListResponse,
} from "@/types/packing-collection";

interface UseGetPackingCollectionDataQueryParams {
  organizationId: string;
  filters?: PackingCollectionFilterOptions;
  enabled?: boolean;
}

export const KEY_USE_GET_PACKING_COLLECTION_DATA = (
  organizationId: string,
  filters?: PackingCollectionFilterOptions
) => ["packingCollectionData", organizationId, Object.values(filters ?? {})];

const useGetPackingCollectionDataQuery = ({
  organizationId,
  filters,
  enabled = true,
}: UseGetPackingCollectionDataQueryParams) => {
  return useQuery<PackingCollectionListResponse, Error>({
    enabled: Boolean(organizationId) && enabled,
    queryFn: () => getPackingCollectionDataService({ filters, organizationId }),
    queryKey: KEY_USE_GET_PACKING_COLLECTION_DATA(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetPackingCollectionDataQuery;
