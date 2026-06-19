import { useQuery } from "@tanstack/react-query";

import type { ApiResponse } from "@/services";
import { getEdgeConfigDataService } from "@/services/edge-config/getEdgeConfigDataService";
import {
  EdgeConfigFilterOptions,
  EdgeConfigResponse,
} from "@/types/edge-config";

export const KEY_USE_GET_EDGE_CONFIG_DATA = (
  organizationId: string,
  filters?: EdgeConfigFilterOptions
) => ["edgeConfigData", organizationId, JSON.stringify(filters)];

interface UseGetEdgeConfigDataQueryParams {
  organizationId: string;
  filters?: EdgeConfigFilterOptions;
  enabled?: boolean;
}

const useGetEdgeConfigDataQuery = ({
  organizationId,
  filters,
  enabled = true,
}: UseGetEdgeConfigDataQueryParams) => {
  return useQuery<ApiResponse<EdgeConfigResponse>, Error>({
    enabled: Boolean(organizationId) && enabled,
    queryFn: () => getEdgeConfigDataService({ filters, organizationId }),
    queryKey: KEY_USE_GET_EDGE_CONFIG_DATA(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetEdgeConfigDataQuery;
