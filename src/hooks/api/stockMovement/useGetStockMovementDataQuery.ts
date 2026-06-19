import { useQuery } from "@tanstack/react-query";

import { ApiResponse } from "@/services";
import {
  getStockMovementDataService,
  StockMovementResponse,
} from "@/services/stockMovement/getStockMovementDataService";
import { InboundFilterOptions } from "@/types/inbound";
import { OutboundFilterOptions } from "@/types/outbound";

type StockMovementFilterOptions = InboundFilterOptions | OutboundFilterOptions;

interface UseGetStockMovementDataQueryParams {
  enabled?: boolean;
  filters?: StockMovementFilterOptions;
  organizationId: string;
  storeId: string;
}

export const KEY_USE_GET_STOCK_MOVEMENT_DATA = (
  organizationId: string,
  storeId: string,
  filters?: StockMovementFilterOptions,
) => ["stockMovementData", organizationId, storeId, JSON.stringify(filters)];

const useGetStockMovementDataQuery = ({
  enabled = true,
  filters,
  organizationId,
  storeId,
}: UseGetStockMovementDataQueryParams) => {
  return useQuery<ApiResponse<StockMovementResponse>, Error>({
    enabled: enabled && Boolean(organizationId) && Boolean(storeId),
    queryFn: () =>
      getStockMovementDataService({
        filters,
        organizationId,
        storeId,
      }),
    queryKey: KEY_USE_GET_STOCK_MOVEMENT_DATA(organizationId, storeId, filters),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 60 * 1000,
  });
};

export default useGetStockMovementDataQuery;
