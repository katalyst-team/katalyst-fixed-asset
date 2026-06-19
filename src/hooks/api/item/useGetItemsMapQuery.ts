import { useQuery } from "@tanstack/react-query";

import { getItemsMapService } from "@/services/item";
import type { GetItemsMapParams, ItemsMapFilterOptions } from "@/types/addRemoveRfid";

export const KEY_USE_GET_ITEMS_MAP = (
  organizationId: string,
  storeId: string,
  filters?: ItemsMapFilterOptions,
) => ["itemsMap", organizationId, storeId, filters];

export const useGetItemsMapQuery = ({
  enabled = true,
  organizationId,
  storeId,
  filters,
}: GetItemsMapParams & { enabled?: boolean }) => {
  return useQuery({
    enabled:
      enabled && Boolean(organizationId) && Boolean(storeId) && Boolean(storeId !== ""),
    queryFn: () =>
      getItemsMapService({
        filters,
        organizationId,
        storeId,
      }),
    queryKey: KEY_USE_GET_ITEMS_MAP(organizationId, storeId, filters),
    staleTime: 30 * 1000, // 30 seconds
  });
};
