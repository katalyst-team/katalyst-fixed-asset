import { useQuery } from "@tanstack/react-query";

import { getGateLogDetailService } from "@/services/gate-log";
import { GateLogDetailResponse } from "@/types/gate-log";

export const KEY_USE_GET_GATE_LOG_DETAIL = (
  organizationId: string,
  gateLogId: string
) => ["gate-log-detail", organizationId, gateLogId];

interface UseGetGateLogDetailQueryProps {
  organizationId: string;
  gateLogId: string;
  enabled?: boolean;
}

const useGetGateLogDetailQuery = ({
  organizationId,
  gateLogId,
  enabled = true,
}: UseGetGateLogDetailQueryProps) => {
  return useQuery<GateLogDetailResponse>({
    enabled: !!organizationId && !!gateLogId && enabled,
    queryFn: () => getGateLogDetailService(organizationId, gateLogId),
    queryKey: KEY_USE_GET_GATE_LOG_DETAIL(organizationId, gateLogId),
  });
};

export default useGetGateLogDetailQuery;
