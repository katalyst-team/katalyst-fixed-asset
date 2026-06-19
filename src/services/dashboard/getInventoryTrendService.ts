import fetcher, { ApiResponse } from "..";

export type IntervalType = "1D" | "7D" | "1M" | "3M" | "CUSTOM";

export interface InventoryTrendDataPoint {
  date: string;
  total: number;
}

export type GetInventoryTrendResponse = ApiResponse<{
  data: Record<string, InventoryTrendDataPoint>;
  end_date: string;
  interval: IntervalType;
  start_date: string;
}>;

interface GetInventoryTrendParams {
  organizationId: string;
  filters?: {
    store_ids?: string;
    sku_ids?: string;
    start_date?: string;
    end_date?: string;
    interval?: IntervalType;
  };
}

export const getInventoryTrendService = async ({
  organizationId,
  filters,
}: GetInventoryTrendParams): Promise<GetInventoryTrendResponse> => {
  const params = new URLSearchParams();

  if (filters?.store_ids) {
    params.append("store_ids", filters.store_ids);
  }

  if (filters?.sku_ids) {
    params.append("sku_ids", filters.sku_ids);
  }

  if (filters?.start_date) {
    params.append("start_date", filters.start_date);
  }

  if (filters?.end_date) {
    params.append("end_date", filters.end_date);
  }

  if (filters?.interval) {
    params.append("interval", filters.interval);
  }

  const url = `/v1/organizations/${organizationId}/dashboards/inventory-trend`;
  return fetcher({
    method: "GET",
    params: params,
    url,
  });
};