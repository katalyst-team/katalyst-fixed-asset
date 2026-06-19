import { useQuery } from "@tanstack/react-query";

import { getStockAuditListService } from "@/services/stock-audit";
import {
  StockAuditFilterOptions,
  StockAuditListResponse,
} from "@/types/stock-audit";

export const KEY_USE_GET_STOCK_AUDIT_LIST = (
  organizationId: string,
  storeId: string,
  filters?: StockAuditFilterOptions
) => ["stock-audit-list", organizationId, storeId, JSON.stringify(filters)];

interface UseGetStockAuditListQueryProps {
  organizationId: string;
  storeId: string;
  filters?: StockAuditFilterOptions;
  enabled?: boolean;
}

const useGetStockAuditListQuery = ({
  organizationId,
  storeId,
  filters,
  enabled = true,
}: UseGetStockAuditListQueryProps) => {
  return useQuery<StockAuditListResponse>({
    enabled: !!organizationId && !!storeId && enabled,
    queryFn: () =>
      getStockAuditListService({ filters, organizationId, storeId }),
    queryKey: KEY_USE_GET_STOCK_AUDIT_LIST(organizationId, storeId, filters),
  });
};

export default useGetStockAuditListQuery;
