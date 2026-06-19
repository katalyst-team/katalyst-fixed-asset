import { useQuery } from "@tanstack/react-query";

import { ApiResponse } from "@/services";
import { getInventoryService } from "@/services/inventory/getInventoryService";
import { InventoryFilterOptions, InventoryResponse } from "@/types/inventory";

interface UseGetInventoryQueryParams {
  filters?: InventoryFilterOptions;
  organizationId: string;
}

export const KEY_USE_GET_INVENTORY_DATA = (
  organizationId: string,
  filters?: InventoryFilterOptions
) => ["inventoryData", organizationId, Object.values(filters ?? {})];

const useGetInventoryQuery = ({
  filters,
  organizationId,
}: UseGetInventoryQueryParams) => {
  return useQuery<ApiResponse<InventoryResponse>, Error>({
    enabled: Boolean(organizationId),
    queryFn: () =>
      getInventoryService({
        filters,
        organizationId,
      }),
    queryKey: KEY_USE_GET_INVENTORY_DATA(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetInventoryQuery;
