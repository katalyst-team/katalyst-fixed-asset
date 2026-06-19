import { useQuery } from "@tanstack/react-query";

import { ApiResponse } from "@/services";
import {
  getStockHealthService,
  StockHealthData,
  StockHealthParams,
} from "@/services/dashboard/getStockHealthService";

export const KEY_USE_GET_STOCK_HEALTH = (
  organizationId: string,
  storeId?: string,
  startDate?: string,
  endDate?: string,
) => ["stockHealth", organizationId, storeId, startDate, endDate];

const useGetStockHealthQuery = ({
  organization_id,
  store_id,
  start_date,
  end_date,
}: StockHealthParams) => {
  return useQuery<ApiResponse<{ data: StockHealthData }>, Error>({
    enabled: Boolean(organization_id),
    queryFn: () =>
      getStockHealthService({
        end_date,
        organization_id,
        start_date,
        store_id,
      }),
    queryKey: KEY_USE_GET_STOCK_HEALTH(
      organization_id,
      store_id,
      start_date,
      end_date,
    ),
    refetchInterval: 300000,
    staleTime: 300000,
  });
};

export default useGetStockHealthQuery;
