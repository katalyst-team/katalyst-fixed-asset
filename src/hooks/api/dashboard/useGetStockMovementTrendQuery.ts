import { useQuery } from "@tanstack/react-query";

import {
  GetStockMovementTrendResponse,
  getStockMovementTrendService,
  IntervalType,
} from "@/services/dashboard/getStockMovementTrendService";

interface UseGetStockMovementTrendQueryParams {
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

export const KEY_USE_GET_STOCK_MOVEMENT_TREND = (organizationId: string) => [
  "stockMovementTrend",
  organizationId,
];

const useGetStockMovementTrendQuery = ({
  enabled = true,
  filters,
  organizationId,
}: UseGetStockMovementTrendQueryParams) => {
  return useQuery<GetStockMovementTrendResponse, Error>({
    enabled: Boolean(organizationId) && enabled,
    queryFn: () => getStockMovementTrendService({ filters, organizationId }),
    queryKey: [...KEY_USE_GET_STOCK_MOVEMENT_TREND(organizationId), filters],
    staleTime: 0,
  });
};

export default useGetStockMovementTrendQuery;