import { useQuery } from "@tanstack/react-query";

import { ApiResponse } from "@/services";
import {
  getLowStockAlertsService,
  LowStockAlertsData,
  LowStockAlertsParams,
} from "@/services/alert/getLowStockAlertsService";

export const KEY_USE_GET_LOW_STOCK_ALERTS = (
  organizationId: string,
  storeId?: string,
  categoryId?: string,
  severity?: string,
  limit?: number,
) => [
  "lowStockAlerts",
  organizationId,
  storeId,
  categoryId,
  severity,
  limit,
];

const useGetLowStockAlertsQuery = ({
  organization_id,
  store_id,
  category_id,
  severity = "all",
  limit = 10,
}: LowStockAlertsParams) => {
  return useQuery<ApiResponse<{ data: LowStockAlertsData }>, Error>({
    enabled: Boolean(organization_id),
    queryFn: () =>
      getLowStockAlertsService({
        category_id,
        limit,
        organization_id,
        severity,
        store_id,
      }),
    queryKey: KEY_USE_GET_LOW_STOCK_ALERTS(
      organization_id,
      store_id,
      category_id,
      severity,
      limit,
    ),
    refetchInterval: 120000,
    staleTime: 120000,
  });
};

export default useGetLowStockAlertsQuery;
