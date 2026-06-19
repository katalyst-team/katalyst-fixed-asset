import fetcher, { ApiResponse } from "..";

export interface DashboardOverviewMetrics {
  total_inbound: number;
  total_items: number;
  total_outbound: number;
  total_sku: number;
}

export type GetDashboardOverviewResponse = ApiResponse<{
  metrics: DashboardOverviewMetrics;
}>;

interface GetDashboardOverviewParams {
  organizationId: string;
  filters?: {
    sku_ids?: string;
    store_ids?: string;
  };
}

export const getDashboardOverviewService = async ({
  organizationId,
  filters,
}: GetDashboardOverviewParams): Promise<GetDashboardOverviewResponse> => {
  const params = new URLSearchParams();

  if (filters?.store_ids) {
    params.append("store_ids", filters.store_ids);
  }

  if (filters?.sku_ids) {
    params.append("sku_ids", filters.sku_ids);
  }

  const url = `/v1/organizations/${organizationId}/dashboards/overview`;
  return fetcher({
    method: "GET",
    params: params,
    url,
  });
};