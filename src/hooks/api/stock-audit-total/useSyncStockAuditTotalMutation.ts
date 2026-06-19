import { useMutation, UseMutationResult } from "@tanstack/react-query";

import { syncStockAuditTotalService } from "@/services/stock-audit-total";
import {
  SyncStockAuditTotalPayload,
  SyncStockAuditTotalResponse,
} from "@/types/stock-audit-total";

interface SyncStockAuditTotalVariables {
  organizationId: string;
  payload: SyncStockAuditTotalPayload;
}

export const useSyncStockAuditTotalMutation = (): UseMutationResult<
  SyncStockAuditTotalResponse,
  Error,
  SyncStockAuditTotalVariables,
  unknown
> => {
  return useMutation({
    mutationFn: ({ organizationId, payload }: SyncStockAuditTotalVariables) =>
      syncStockAuditTotalService({ organizationId, payload }),
    mutationKey: ["sync-stock-audit-total"],
  });
};
