import {
  StockAuditCreateResponse,
  StockAuditUpdatePayload,
} from "@/types/stock-audit";

import fetcher from "..";

export interface UpdateStockAuditParams {
  organizationId: string;
  storeId: string;
  auditId: string;
  payload: StockAuditUpdatePayload;
}

export const updateStockAuditService = (
  params: UpdateStockAuditParams
): Promise<StockAuditCreateResponse> => {
  return fetcher({
    data: params.payload,
    method: "PATCH",
    url: `/v1/organizations/${params.organizationId}/stores/${params.storeId}/audits/${params.auditId}`,
  });
};

