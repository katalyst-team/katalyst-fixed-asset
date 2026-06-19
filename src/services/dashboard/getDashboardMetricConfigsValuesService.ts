import fetcher, { ApiResponse } from "..";

export interface DashboardMetricConfigValue {
  label: string;
  name: string;
  value: number;
}

export type GetDashboardMetricConfigsValuesResponse = ApiResponse<{
  values: DashboardMetricConfigValue[];
}>;

interface GetDashboardMetricConfigsValuesParams {
  organizationId: string;
  store_ids?: string;
}

export const getDashboardMetricConfigsValuesService = async ({
  organizationId,
  store_ids,
}: GetDashboardMetricConfigsValuesParams): Promise<GetDashboardMetricConfigsValuesResponse> => {
  const params = new URLSearchParams();

  if (store_ids) {
    params.append("store_ids", store_ids);
  }

  return fetcher({
    method: "GET",
    params,
    url: `/v1/organizations/${organizationId}/dashboard-metric-configs/values`,
  });
};
