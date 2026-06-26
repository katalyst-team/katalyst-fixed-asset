import { useQuery } from "@tanstack/react-query";

import {
  GetSecurityAlertsResponse,
  getSecurityAlertsService,
} from "@/services/fixed-assets/getSecurityAlertsService";
import type { FaSecurityAlertFilterOptions } from "@/types/fixed-assets";

interface UseGetSecurityAlertsQueryParams
  extends FaSecurityAlertFilterOptions {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_SECURITY_ALERTS = (
  organizationId: string,
  filters?: FaSecurityAlertFilterOptions,
) => ["faSecurityAlerts", organizationId, JSON.stringify(filters ?? {})];

const useGetSecurityAlertsQuery = ({
  enabled = true,
  limit,
  organizationId,
  page,
  severity,
  status,
}: UseGetSecurityAlertsQueryParams) => {
  const filters: FaSecurityAlertFilterOptions = {
    limit,
    page,
    severity,
    status,
  };

  return useQuery<GetSecurityAlertsResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getSecurityAlertsService({ ...filters, organizationId }),
    queryKey: KEY_USE_GET_FA_SECURITY_ALERTS(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetSecurityAlertsQuery;
