import fetcher from "@/services";
import {
  StockAuditTotalListFilters,
  StockAuditTotalListResponse,
} from "@/types/stock-audit-total";

interface GetStockAuditTotalListParams {
  filters?: StockAuditTotalListFilters;
  organizationId: string;
}

export const getStockAuditTotalListService = ({
  filters,
  organizationId,
}: GetStockAuditTotalListParams): Promise<StockAuditTotalListResponse> => {
  const queryParams = new URLSearchParams();

  if (filters?.store_id) queryParams.append("store_id", filters.store_id);
  if (filters?.status) queryParams.append("status", filters.status);
  if (filters?.source) queryParams.append("source", filters.source);
  if (filters?.date_from) queryParams.append("date_from", filters.date_from);
  if (filters?.date_to) queryParams.append("date_to", filters.date_to);

  const query = queryParams.toString();

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/stock-audit-total${query ? `?${query}` : ""}`,
  });
};
