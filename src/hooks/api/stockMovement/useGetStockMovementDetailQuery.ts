import { useQuery } from "@tanstack/react-query";

import { ApiResponse } from "@/services";
import { getStockMovementDetailService } from "@/services/stockMovement/getStockMovementDetailService";
import { DetailStockMovementResponse } from "@/types/detailStockMovement";

interface UseGetStockMovementDetailQueryParams {
  organizationId: string;
  storeId: string;
  stockMovementId: string;
  enabled?: boolean;
}

export const KEY_USE_GET_STOCK_MOVEMENT_DETAIL = (
  organizationId: string,
  storeId: string,
  stockMovementId: string
) => ["stockMovementDetail", organizationId, storeId, stockMovementId];

const useGetStockMovementDetailQuery = ({
  organizationId,
  storeId,
  stockMovementId,
  enabled = true,
}: UseGetStockMovementDetailQueryParams) => {
  return useQuery<ApiResponse<DetailStockMovementResponse>, Error>({
    enabled: Boolean(organizationId) && Boolean(storeId) && Boolean(stockMovementId) && enabled,
    queryFn: () =>
      getStockMovementDetailService({
        organizationId,
        stockMovementId,
        storeId,
      }),
    queryKey: KEY_USE_GET_STOCK_MOVEMENT_DETAIL(organizationId, storeId, stockMovementId),
    staleTime: 60 * 1000,
  });
};

export default useGetStockMovementDetailQuery;
