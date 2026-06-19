import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cancelStockMovementService } from "@/services/stockMovement/cancelStockMovementService";

interface UseCancelStockMovementMutationProps {
  onError?: (error: unknown) => void;
  onSuccess?: () => void;
}

const useCancelStockMovementMutation = ({
  onError,
  onSuccess,
}: UseCancelStockMovementMutationProps = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelStockMovementService,
    onError,
    onSuccess: (_, { organizationId, storeId }) => {
      queryClient.invalidateQueries({
        queryKey: ["stockMovementData", organizationId, storeId],
      });
      onSuccess?.();
    },
  });
};

export default useCancelStockMovementMutation;
