import { useQuery } from "@tanstack/react-query";

import {
  GetFADashboardResponse,
  getFADashboardService,
} from "@/services/fixed-assets/getFADashboardService";

interface UseGetFADashboardQueryParams {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_DASHBOARD = (organizationId: string) => [
  "faDashboard",
  organizationId,
];

const useGetFADashboardQuery = ({
  enabled = true,
  organizationId,
}: UseGetFADashboardQueryParams) => {
  return useQuery<GetFADashboardResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getFADashboardService({ organizationId }),
    queryKey: KEY_USE_GET_FA_DASHBOARD(organizationId),
    staleTime: 60 * 1000,
  });
};

export default useGetFADashboardQuery;
