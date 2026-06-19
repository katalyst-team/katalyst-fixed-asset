import { useQuery } from "@tanstack/react-query";

import {
  GetDashboardOverviewResponse,
  getDashboardOverviewService,
} from "@/services/dashboard/getDashboardOverviewService";

interface UseGetDashboardOverviewQueryParams {
  organizationId: string;
  filters?: {
    sku_ids?: string;
    store_ids?: string;
  };
  enabled?: boolean;
}

export const KEY_USE_GET_DASHBOARD_OVERVIEW = (organizationId: string) => [
  "dashboardOverview",
  organizationId,
];

const useGetDashboardOverviewQuery = ({
  enabled = true,
  filters,
  organizationId,
}: UseGetDashboardOverviewQueryParams) => {
  return useQuery<GetDashboardOverviewResponse, Error>({
    enabled: Boolean(organizationId) && enabled,
    queryFn: () => getDashboardOverviewService({ filters, organizationId }),
    queryKey: [...KEY_USE_GET_DASHBOARD_OVERVIEW(organizationId), filters],
    staleTime: 0,
  });
};

export default useGetDashboardOverviewQuery;