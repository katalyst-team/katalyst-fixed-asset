import { useQuery } from "@tanstack/react-query";

import { ApiResponse } from "@/services";
import {
  getStockMovementTypesService,
  StockMovementTypesResponse,
} from "@/services/stock-audit/getStockMovementTypesService";

export const KEY_USE_GET_STOCK_MOVEMENT_TYPES = (organizationId: string) => [
  "stockMovementTypes",
  organizationId,
];

const useGetStockMovementTypesQuery = (organizationId: string) => {
  return useQuery<ApiResponse<StockMovementTypesResponse>, Error>({
    enabled: Boolean(organizationId),
    queryFn: () => getStockMovementTypesService(organizationId),
    queryKey: KEY_USE_GET_STOCK_MOVEMENT_TYPES(organizationId),
    staleTime: 5 * 60 * 1000,
  });
};

export default useGetStockMovementTypesQuery;
