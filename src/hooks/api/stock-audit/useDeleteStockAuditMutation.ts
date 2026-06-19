import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteStockAuditService } from "@/services/stock-audit";
import { StockAuditCreateResponse } from "@/types/stock-audit";

interface UseDeleteStockAuditMutationProps {
  organizationId: string;
  onSuccess?: (data: StockAuditCreateResponse) => void;
  onError?: (error: unknown) => void;
}

const useDeleteStockAuditMutation = ({
  organizationId,
  onSuccess,
  onError,
}: UseDeleteStockAuditMutationProps) => {
  const queryClient = useQueryClient();

  return useMutation<
    StockAuditCreateResponse,
    unknown,
    { auditId: string; storeId: string }
  >({
    mutationFn: ({ auditId, storeId }) =>
      deleteStockAuditService({ auditId, organizationId, storeId }),
    onError: (error) => {
      if (onError) {
        onError(error);
      }
    },
    onSuccess: (data, variables) => {
      toast.success("Stock audit deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["stock-audit-list", organizationId, variables.storeId],
      });

      if (onSuccess) {
        onSuccess(data);
      }
    },
  });
};

export default useDeleteStockAuditMutation;
