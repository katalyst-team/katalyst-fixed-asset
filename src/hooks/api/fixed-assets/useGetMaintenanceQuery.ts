import { useQuery } from "@tanstack/react-query";

import {
  GetMaintenanceResponse,
  getMaintenanceService,
} from "@/services/fixed-assets/getMaintenanceService";
import type { FaMaintenanceTab } from "@/types/fixed-assets";

interface UseGetMaintenanceQueryParams {
  enabled?: boolean;
  organizationId: string;
  tab?: FaMaintenanceTab;
}

export const KEY_USE_GET_FA_MAINTENANCE = (
  organizationId: string,
  tab?: FaMaintenanceTab,
) => ["faMaintenance", organizationId, tab];

const useGetMaintenanceQuery = ({
  enabled = true,
  organizationId,
  tab,
}: UseGetMaintenanceQueryParams) => {
  return useQuery<GetMaintenanceResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getMaintenanceService({ organizationId, tab }),
    queryKey: KEY_USE_GET_FA_MAINTENANCE(organizationId, tab),
    staleTime: 60 * 1000,
  });
};

export default useGetMaintenanceQuery;
