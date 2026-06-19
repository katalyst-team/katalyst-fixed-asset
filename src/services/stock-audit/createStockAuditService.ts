import {
  StockAuditCreatePayload,
  StockAuditCreateResponse,
} from "@/types/stock-audit";

import fetcher from "..";

export interface CreateStockAuditParams {
  organizationId: string;
  storeId: string;
  payload: StockAuditCreatePayload;
}

export const createStockAuditService = (
  params: CreateStockAuditParams
): Promise<StockAuditCreateResponse> => {
  return fetcher({
    data: params.payload,
    method: "POST",
    url: `/v1/organizations/${params.organizationId}/stores/${params.storeId}/audits`,
  });
};

