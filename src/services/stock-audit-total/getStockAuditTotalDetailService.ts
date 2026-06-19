import fetcher from "@/services";
import { StockAuditTotalDetailResponse } from "@/types/stock-audit-total";

interface GetStockAuditTotalDetailParams {
  organizationId: string;
  sessionId: string;
}

export const getStockAuditTotalDetailService = ({
  organizationId,
  sessionId,
}: GetStockAuditTotalDetailParams): Promise<StockAuditTotalDetailResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/stock-audit-total/${sessionId}`,
  });
};
