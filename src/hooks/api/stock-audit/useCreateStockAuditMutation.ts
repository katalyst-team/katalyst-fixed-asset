import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createStockAuditService } from "@/services/stock-audit";
import {
  StockAuditCreatePayload,
  StockAuditCreateResponse,
} from "@/types/stock-audit";

interface UseCreateStockAuditMutationProps {
  organizationId: string;
  storeId: string;
  onSuccess?: (data: StockAuditCreateResponse) => void;
  onError?: (error: unknown) => void;
}

const useCreateStockAuditMutation = ({
  organizationId,
  storeId,
  onSuccess,
  onError,
}: UseCreateStockAuditMutationProps) => {
  const queryClient = useQueryClient();

  return useMutation<
    StockAuditCreateResponse,
    unknown,
    StockAuditCreatePayload
  >({
    mutationFn: (payload) =>
      createStockAuditService({
        organizationId,
        payload,
        storeId: payload.store_id,
      }),
    onError: (error) => {
      if (onError) {
        onError(error);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["stock-audit-list", organizationId, storeId],
      });

      if (onSuccess) {
        onSuccess(data);
      }
    },
  });
};

export default useCreateStockAuditMutation;
