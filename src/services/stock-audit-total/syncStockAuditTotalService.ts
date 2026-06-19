import fetcher from "@/services";
import {
  SyncStockAuditTotalPayload,
  SyncStockAuditTotalResponse,
} from "@/types/stock-audit-total";

interface SyncStockAuditTotalParams {
  organizationId: string;
  payload: SyncStockAuditTotalPayload;
}

export const syncStockAuditTotalService = ({
  organizationId,
  payload,
}: SyncStockAuditTotalParams): Promise<SyncStockAuditTotalResponse> => {
  return fetcher({
    data: payload,
    method: "POST",
    url: `/v1/organizations/${organizationId}/stock-audit-total/sync`,
  });
};
