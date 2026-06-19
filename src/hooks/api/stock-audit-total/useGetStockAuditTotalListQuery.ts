import { useQuery } from "@tanstack/react-query";

import { getStockAuditTotalListService } from "@/services/stock-audit-total";
import {
  StockAuditTotalListFilters,
  StockAuditTotalListResponse,
} from "@/types/stock-audit-total";

export const KEY_USE_GET_STOCK_AUDIT_TOTAL_LIST = (
  organizationId: string,
  filters?: StockAuditTotalListFilters,
) => ["stock-audit-total-list", organizationId, JSON.stringify(filters)];

interface UseGetStockAuditTotalListQueryProps {
  enabled?: boolean;
  filters?: StockAuditTotalListFilters;
  organizationId: string;
}

const useGetStockAuditTotalListQuery = ({
  enabled = true,
  filters,
  organizationId,
}: UseGetStockAuditTotalListQueryProps) => {
  return useQuery<StockAuditTotalListResponse>({
    enabled: Boolean(organizationId) && enabled,
    queryFn: () => getStockAuditTotalListService({ filters, organizationId }),
    queryKey: KEY_USE_GET_STOCK_AUDIT_TOTAL_LIST(organizationId, filters),
  });
};

export default useGetStockAuditTotalListQuery;
