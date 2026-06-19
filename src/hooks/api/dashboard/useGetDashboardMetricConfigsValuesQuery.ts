import { useQuery } from "@tanstack/react-query";

import {
  GetDashboardMetricConfigsValuesResponse,
  getDashboardMetricConfigsValuesService,
} from "@/services/dashboard/getDashboardMetricConfigsValuesService";

export const KEY_USE_GET_DASHBOARD_METRIC_CONFIGS_VALUES = (
  organizationId: string,
  store_ids?: string,
) => ["dashboardMetricConfigsValues", organizationId, store_ids];

interface UseGetDashboardMetricConfigsValuesQueryParams {
  enabled?: boolean;
  organizationId: string;
  store_ids?: string;
}

const useGetDashboardMetricConfigsValuesQuery = ({
  enabled = true,
  organizationId,
  store_ids,
}: UseGetDashboardMetricConfigsValuesQueryParams) => {
  return useQuery<GetDashboardMetricConfigsValuesResponse, Error>({
    enabled: Boolean(organizationId) && enabled,
    queryFn: () =>
      getDashboardMetricConfigsValuesService({ organizationId, store_ids }),
    queryKey: KEY_USE_GET_DASHBOARD_METRIC_CONFIGS_VALUES(organizationId, store_ids),
    staleTime: 0,
  });
};

export default useGetDashboardMetricConfigsValuesQuery;
