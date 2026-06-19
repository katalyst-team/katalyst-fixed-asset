import { useQuery } from "@tanstack/react-query";

import { getInventoryAreaDetailService } from "@/services/inventory-area";
import {
  InventoryAreaDetailFilterOptions,
  InventoryAreaDetailResponse,
} from "@/types/inventory-area";

export const KEY_USE_GET_INVENTORY_AREA_DETAIL = (
  organizationId: string,
  storeId: string,
  sectionId: string,
  filters?: InventoryAreaDetailFilterOptions
) => [
  "inventory-area-detail",
  organizationId,
  storeId,
  sectionId,
  JSON.stringify(filters),
];

interface UseGetInventoryAreaDetailQueryProps {
  organizationId: string;
  storeId: string;
  sectionId: string;
  filters?: InventoryAreaDetailFilterOptions;
  enabled?: boolean;
}

const useGetInventoryAreaDetailQuery = ({
  organizationId,
  storeId,
  sectionId,
  filters,
  enabled = true,
}: UseGetInventoryAreaDetailQueryProps) => {
  return useQuery<InventoryAreaDetailResponse>({
    enabled: !!organizationId && !!storeId && !!sectionId && enabled,
    queryFn: () =>
      getInventoryAreaDetailService({
        filters,
        organizationId,
        sectionId,
        storeId,
      }),
    queryKey: KEY_USE_GET_INVENTORY_AREA_DETAIL(
      organizationId,
      storeId,
      sectionId,
      filters
    ),
    staleTime: 60 * 1000,
  });
};

export default useGetInventoryAreaDetailQuery;
