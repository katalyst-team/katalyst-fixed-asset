import { useQuery } from "@tanstack/react-query";

import {
  GetRTLSPositionsResponse,
  getRTLSPositionsService,
} from "@/services/fixed-assets/getRTLSPositionsService";
import type { FaRTLSPositionFilterOptions } from "@/types/fixed-assets";

interface UseGetRTLSPositionsQueryParams extends FaRTLSPositionFilterOptions {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_RTLS_POSITIONS = (
  organizationId: string,
  filters?: FaRTLSPositionFilterOptions,
) => ["faRTLSPositions", organizationId, JSON.stringify(filters ?? {})];

const useGetRTLSPositionsQuery = ({
  enabled = true,
  floor,
  organizationId,
  site_id,
  zone,
}: UseGetRTLSPositionsQueryParams) => {
  const filters: FaRTLSPositionFilterOptions = { floor, site_id, zone };

  return useQuery<GetRTLSPositionsResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getRTLSPositionsService({ ...filters, organizationId }),
    queryKey: KEY_USE_GET_FA_RTLS_POSITIONS(organizationId, filters),
    staleTime: 5 * 1000,
  });
};

export default useGetRTLSPositionsQuery;
