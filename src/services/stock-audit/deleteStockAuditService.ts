import { StockAuditCreateResponse } from "@/types/stock-audit";

import fetcher from "..";

export interface DeleteStockAuditParams {
  organizationId: string;
  storeId: string;
  auditId: string;
}

export const deleteStockAuditService = (
  params: DeleteStockAuditParams
): Promise<StockAuditCreateResponse> => {
  return fetcher({
    method: "DELETE",
    url: `/v1/organizations/${params.organizationId}/stores/${params.storeId}/audits/${params.auditId}`,
  });
};

