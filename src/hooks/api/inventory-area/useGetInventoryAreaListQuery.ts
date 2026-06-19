import { useQuery } from "@tanstack/react-query";

import { getInventoryAreaListService } from "@/services/inventory-area";
import {
  InventoryAreaFilterOptions,
  InventoryAreaListResponse,
} from "@/types/inventory-area";

export const KEY_USE_GET_INVENTORY_AREA_LIST = (
  organizationId: string,
  storeId: string,
  filters?: InventoryAreaFilterOptions
) => ["inventory-area-list", organizationId, storeId, JSON.stringify(filters)];

interface UseGetInventoryAreaListQueryProps {
  organizationId: string;
  storeId: string;
  filters?: InventoryAreaFilterOptions;
  enabled?: boolean;
}

const useGetInventoryAreaListQuery = ({
  organizationId,
  storeId,
  filters,
  enabled = true,
}: UseGetInventoryAreaListQueryProps) => {
  return useQuery<InventoryAreaListResponse>({
    enabled: !!organizationId && !!storeId && enabled,
    queryFn: () =>
      getInventoryAreaListService({ filters, organizationId, storeId }),
    queryKey: KEY_USE_GET_INVENTORY_AREA_LIST(organizationId, storeId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetInventoryAreaListQuery;
