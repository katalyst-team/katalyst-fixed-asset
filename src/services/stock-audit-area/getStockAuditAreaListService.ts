import {
  StockAuditAreaFilterOptions,
  StockAuditAreaListResponse,
} from "@/types/stock-audit-area";

import fetcher from "..";

export interface GetStockAuditAreaListParams {
  organizationId: string;
  storeId: string;
  filters?: StockAuditAreaFilterOptions;
}

export const getStockAuditAreaListService = (
  params: GetStockAuditAreaListParams
): Promise<StockAuditAreaListResponse> => {
  const queryParams = new URLSearchParams();

  if (params.filters?.sort) queryParams.append("sort", params.filters.sort);
  if (params.filters?.date) queryParams.append("date", params.filters.date);
  params.filters?.stock_movement_type_names?.forEach((name) =>
    queryParams.append("stock_movement_type_names", name),
  );

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${params.organizationId}/stores/${params.storeId}/section-direct-audits${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`,
  });
};

