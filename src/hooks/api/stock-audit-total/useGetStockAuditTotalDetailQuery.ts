import { useQuery } from "@tanstack/react-query";

import { getStockAuditTotalDetailService } from "@/services/stock-audit-total";
import { StockAuditTotalDetailResponse } from "@/types/stock-audit-total";

export const KEY_USE_GET_STOCK_AUDIT_TOTAL_DETAIL = (
  organizationId: string,
  sessionId: string,
) => ["stock-audit-total-detail", organizationId, sessionId];

interface UseGetStockAuditTotalDetailQueryProps {
  enabled?: boolean;
  organizationId: string;
  sessionId: string;
}

const useGetStockAuditTotalDetailQuery = ({
  enabled = true,
  organizationId,
  sessionId,
}: UseGetStockAuditTotalDetailQueryProps) => {
  return useQuery<StockAuditTotalDetailResponse>({
    enabled: Boolean(organizationId) && Boolean(sessionId) && enabled,
    queryFn: () => getStockAuditTotalDetailService({ organizationId, sessionId }),
    queryKey: KEY_USE_GET_STOCK_AUDIT_TOTAL_DETAIL(organizationId, sessionId),
  });
};

export default useGetStockAuditTotalDetailQuery;
