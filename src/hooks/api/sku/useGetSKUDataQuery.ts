import { useQuery } from "@tanstack/react-query";

import { getSkuDataService } from "../../../services/sku/getSkuDataService";

export interface UseGetSkuDataQueryParams {
  organizationId: string;
  filters?: Parameters<typeof getSkuDataService>[0]["filters"];
  enabled?: boolean;
}

export const KEY_USE_GET_SKU_DATA = (
  organizationId: string,
  filters?: UseGetSkuDataQueryParams["filters"],
) => ["skus", organizationId, JSON.stringify(filters)];

export const useGetSkuDataQuery = ({
  organizationId,
  filters,
  enabled,
}: UseGetSkuDataQueryParams) => {
  return useQuery({
    enabled: enabled !== undefined ? enabled : Boolean(organizationId),
    queryFn: () =>
      getSkuDataService({
        filters,
        organizationId,
      }),
    queryKey: KEY_USE_GET_SKU_DATA(organizationId, filters),
    staleTime: 60 * 1000,
  });
};
