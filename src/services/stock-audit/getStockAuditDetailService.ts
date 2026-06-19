import { StockAuditDetailResponse } from "@/types/stock-audit";

import fetcher from "..";

export interface GetStockAuditDetailParams {
  organizationId: string;
  storeId: string;
  auditId: string;
}

export const getStockAuditDetailService = (
  params: GetStockAuditDetailParams
): Promise<StockAuditDetailResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${params.organizationId}/stores/${params.storeId}/audits/${params.auditId}`,
  });
};

