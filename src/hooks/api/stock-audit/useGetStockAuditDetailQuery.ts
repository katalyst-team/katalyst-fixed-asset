import { useQuery } from "@tanstack/react-query";

import { getStockAuditDetailService } from "@/services/stock-audit";
import { StockAuditDetailResponse } from "@/types/stock-audit";

export const KEY_USE_GET_STOCK_AUDIT_DETAIL = (
  organizationId: string,
  storeId: string,
  auditId: string
) => ["stock-audit-detail", organizationId, storeId, auditId];

interface UseGetStockAuditDetailQueryProps {
  organizationId: string;
  storeId: string;
  auditId: string;
  enabled?: boolean;
}

const useGetStockAuditDetailQuery = ({
  organizationId,
  storeId,
  auditId,
  enabled = true,
}: UseGetStockAuditDetailQueryProps) => {
  return useQuery<StockAuditDetailResponse>({
    enabled: !!organizationId && !!storeId && !!auditId && enabled,
    queryFn: () =>
      getStockAuditDetailService({ auditId, organizationId, storeId }),
    queryKey: KEY_USE_GET_STOCK_AUDIT_DETAIL(organizationId, storeId, auditId),
  });
};

export default useGetStockAuditDetailQuery;
