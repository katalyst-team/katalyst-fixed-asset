import { useQuery } from "@tanstack/react-query";

import { StockMovementType } from "@/services/stockMovement/getStockMovementDataService";
import { getStockMovementTypesService } from "@/services/stockMovement/getStockMovementTypesService";

interface UseGetStockMovementTypesQueryParams {
  organizationId: string;
}

export const KEY_USE_GET_STOCK_MOVEMENT_TYPES = (organizationId: string) => [
  "stockMovementTypes",
  organizationId,
];

const useGetStockMovementTypesQuery = ({
  organizationId,
}: UseGetStockMovementTypesQueryParams) => {
  return useQuery<StockMovementType[], Error>({
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const response = await getStockMovementTypesService({
        organizationId,
      });
      return response.data.stock_movement_types;
    },

    queryKey: KEY_USE_GET_STOCK_MOVEMENT_TYPES(organizationId),
    staleTime: 5 * 60 * 1000,
  });
};

export default useGetStockMovementTypesQuery;
