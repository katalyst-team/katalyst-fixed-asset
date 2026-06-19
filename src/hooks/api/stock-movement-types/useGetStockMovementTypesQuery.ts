import { useQuery } from "@tanstack/react-query";

import {
  GetStockMovementTypesResponse,
  getStockMovementTypesService,
  StockMovementTypesFilters,
} from "@/services/stock-movement-types/getStockMovementTypesService";

export const KEY_USE_GET_STOCK_MOVEMENT_TYPES = (
  organizationId: string,
  filters?: StockMovementTypesFilters
) => ["stock-movement-types-list", organizationId, JSON.stringify(filters)];

interface UseGetStockMovementTypesQueryProps {
  organizationId: string;
  filters?: StockMovementTypesFilters;
  enabled?: boolean;
}

const useGetStockMovementTypesQuery = ({
  organizationId,
  filters,
  enabled = true,
}: UseGetStockMovementTypesQueryProps) => {
  return useQuery<GetStockMovementTypesResponse>({
    enabled: !!organizationId && enabled,
    queryFn: () => getStockMovementTypesService(organizationId, filters),
    queryKey: KEY_USE_GET_STOCK_MOVEMENT_TYPES(organizationId, filters),
  });
};

export default useGetStockMovementTypesQuery;
