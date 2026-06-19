import {
  StockAuditFilterOptions,
  StockAuditListResponse,
} from "@/types/stock-audit";

import fetcher from "..";

export interface GetStockAuditListParams {
  organizationId: string;
  storeId: string;
  filters?: StockAuditFilterOptions;
}

export const getStockAuditListService = (
  params: GetStockAuditListParams
): Promise<StockAuditListResponse> => {
  const queryParams = new URLSearchParams();

  if (params.filters?.type) queryParams.append("type", params.filters.type);
  if (params.filters?.status)
    queryParams.append("status", params.filters.status);
  if (params.filters?.aor_id)
    queryParams.append("aor_id", params.filters.aor_id);
  if (params.filters?.result)
    queryParams.append("result", params.filters.result);
  if (params.filters?.checking_object_id)
    queryParams.append("checking_object_id", params.filters.checking_object_id);
  if (params.filters?.cursor)
    queryParams.append("cursor", params.filters.cursor);
  if (params.filters?.limit)
    queryParams.append("limit", params.filters.limit.toString());
  if (params.filters?.order_direction)
    queryParams.append("order_direction", params.filters.order_direction);
  params.filters?.stock_movement_type_names?.forEach((name) =>
    queryParams.append("stock_movement_type_names", name),
  );

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${params.organizationId}/stores/${params.storeId}/audits${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`,
  });
};

