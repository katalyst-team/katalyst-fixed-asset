import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateStockAuditService } from "@/services/stock-audit";
import {
  StockAuditCreateResponse,
  StockAuditUpdatePayload,
} from "@/types/stock-audit";

import { KEY_USE_GET_STOCK_AUDIT_DETAIL } from "./useGetStockAuditDetailQuery";

interface UseUpdateStockAuditMutationProps {
  organizationId: string;
  storeId: string;
  auditId: string;
  onSuccess?: (data: StockAuditCreateResponse) => void;
  onError?: (error: unknown) => void;
}

interface UpdateStockAuditParams {
  payload: StockAuditUpdatePayload;
}

const useUpdateStockAuditMutation = ({
  organizationId,
  storeId,
  auditId,
  onSuccess,
  onError,
}: UseUpdateStockAuditMutationProps) => {
  const queryClient = useQueryClient();

  return useMutation<StockAuditCreateResponse, unknown, UpdateStockAuditParams>(
    {
      mutationFn: ({ payload }) =>
        updateStockAuditService({ auditId, organizationId, payload, storeId }),
      onError: (error) => {
        if (onError) {
          onError(error);
        }
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: ["stock-audit-list", organizationId, storeId],
        });

        queryClient.invalidateQueries({
          queryKey: KEY_USE_GET_STOCK_AUDIT_DETAIL(
            organizationId,
            storeId,
            auditId
          ),
        });

        if (onSuccess) {
          onSuccess(data);
        }
      },
    }
  );
};

export default useUpdateStockAuditMutation;
