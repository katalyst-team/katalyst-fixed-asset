import { useQuery } from "@tanstack/react-query";

import {
  GetInventoryTrendResponse,
  getInventoryTrendService,
  IntervalType,
} from "@/services/dashboard/getInventoryTrendService";

interface UseGetInventoryTrendQueryParams {
  organizationId: string;
  filters?: {
    store_ids?: string;
    sku_ids?: string;
    start_date?: string;
    end_date?: string;
    interval?: IntervalType;
  };
  enabled?: boolean;
}

export const KEY_USE_GET_INVENTORY_TREND = (organizationId: string) => [
  "inventoryTrend",
  organizationId,
];

const useGetInventoryTrendQuery = ({
  enabled = true,
  filters,
  organizationId,
}: UseGetInventoryTrendQueryParams) => {
  return useQuery<GetInventoryTrendResponse, Error>({
    enabled: Boolean(organizationId) && enabled,
    queryFn: () => getInventoryTrendService({ filters, organizationId }),
    queryKey: [...KEY_USE_GET_INVENTORY_TREND(organizationId), filters],
    staleTime: 0,
  });
};

export default useGetInventoryTrendQuery;