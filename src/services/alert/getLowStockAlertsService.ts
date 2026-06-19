import { LowStockAlertsData, LowStockAlertsParams } from "@/types/low-stock-alert";

import fetcher, { ApiResponse } from "..";

export type { LowStockAlertsData, LowStockAlertsParams };

export const getLowStockAlertsService = async ({
  organization_id,
  store_id,
  category_id,
  severity = "all",
  limit = 10,
}: LowStockAlertsParams): Promise<ApiResponse<{ data: LowStockAlertsData }>> => {
  const queryParams = new URLSearchParams();
  if (store_id) queryParams.append("store_id", store_id);
  if (category_id) queryParams.append("category_id", category_id);
  queryParams.append("severity", severity);
  queryParams.append("limit", limit.toString());

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organization_id}/alerts/low-stock?${queryParams.toString()}`,
  });
};
