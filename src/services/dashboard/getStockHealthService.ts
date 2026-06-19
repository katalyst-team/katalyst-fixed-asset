import { StockHealthData, StockHealthParams } from "@/types/stock-health";

import fetcher, { ApiResponse } from "..";

export type { StockHealthData, StockHealthParams };

export const getStockHealthService = async ({
  organization_id,
  store_id,
  start_date,
  end_date,
}: StockHealthParams): Promise<ApiResponse<{ data: StockHealthData }>> => {
  const queryParams = new URLSearchParams();
  if (store_id) queryParams.append("store_id", store_id);
  if (start_date) queryParams.append("start_date", start_date);
  if (end_date) queryParams.append("end_date", end_date);

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organization_id}/analytics/stock-health?${queryParams.toString()}`,
  });
};
