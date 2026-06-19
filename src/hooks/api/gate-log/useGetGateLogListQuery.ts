import { useQuery } from "@tanstack/react-query";

import { getGateLogListService } from "@/services/gate-log";
import { GateLogFilterOptions, GateLogListResponse } from "@/types/gate-log";

export const KEY_USE_GET_GATE_LOG_LIST = (
  organizationId: string,
  filters?: GateLogFilterOptions
) => ["gate-log-list", organizationId, JSON.stringify(filters)];

interface UseGetGateLogListQueryProps {
  organizationId: string;
  filters?: GateLogFilterOptions;
  enabled?: boolean;
}

const useGetGateLogListQuery = ({
  organizationId,
  filters,
  enabled = true,
}: UseGetGateLogListQueryProps) => {
  return useQuery<GateLogListResponse>({
    enabled: !!organizationId && enabled,
    queryFn: () => getGateLogListService(organizationId, filters),
    queryKey: KEY_USE_GET_GATE_LOG_LIST(organizationId, filters),
  });
};

export default useGetGateLogListQuery;
