import { useQuery } from "@tanstack/react-query";

import type { ApiResponse } from "@/services";
import { getGateListService } from "@/services/gate/getGateListService";
import { GateListFilter, GateListResponse } from "@/types/gate";

export const KEY_USE_GET_GATE_LIST = (
  organizationId: string,
  filters?: GateListFilter,
) => ["gateList", organizationId, JSON.stringify(filters)];

interface UseGetGateListQueryParams {
  enabled?: boolean;
  filters?: GateListFilter;
  organizationId: string;
}

const useGetGateListQuery = ({
  enabled = true,
  filters,
  organizationId,
}: UseGetGateListQueryParams) => {
  return useQuery<ApiResponse<GateListResponse>, Error>({
    enabled: Boolean(organizationId) && enabled,
    queryFn: () => getGateListService({ filters, organizationId }),
    queryKey: KEY_USE_GET_GATE_LIST(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetGateListQuery;
