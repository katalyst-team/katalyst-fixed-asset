import { useQuery } from "@tanstack/react-query";

import { getStockAuditAreaListService } from "@/services/stock-audit-area";
import {
  StockAuditAreaFilterOptions,
  StockAuditAreaListResponse,
} from "@/types/stock-audit-area";

export const KEY_USE_GET_STOCK_AUDIT_AREA_LIST = (
  organizationId: string,
  storeId: string,
  filters?: StockAuditAreaFilterOptions
) => [
  "stock-audit-area-list",
  organizationId,
  storeId,
  JSON.stringify(filters),
];

interface UseGetStockAuditAreaListQueryProps {
  organizationId: string;
  storeId: string;
  filters?: StockAuditAreaFilterOptions;
  enabled?: boolean;
}

const useGetStockAuditAreaListQuery = ({
  organizationId,
  storeId,
  filters,
  enabled = true,
}: UseGetStockAuditAreaListQueryProps) => {
  return useQuery<StockAuditAreaListResponse>({
    enabled: !!organizationId && !!storeId && enabled,
    queryFn: () =>
      getStockAuditAreaListService({ filters, organizationId, storeId }),
    queryKey: KEY_USE_GET_STOCK_AUDIT_AREA_LIST(
      organizationId,
      storeId,
      filters
    ),
  });
};

export default useGetStockAuditAreaListQuery;
