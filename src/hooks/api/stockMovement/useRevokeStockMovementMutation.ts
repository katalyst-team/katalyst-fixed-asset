import { useMutation, useQueryClient } from "@tanstack/react-query";

import { revokeStockMovementService } from "@/services/stockMovement/revokeStockMovementService";

interface UseRevokeStockMovementMutationProps {
  onError?: (error: unknown) => void;
  onSuccess?: () => void;
}

const useRevokeStockMovementMutation = ({
  onError,
  onSuccess,
}: UseRevokeStockMovementMutationProps = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeStockMovementService,
    onError,
    onSuccess: (_, { organizationId, storeId }) => {
      queryClient.invalidateQueries({
        queryKey: ["stockMovementData", organizationId, storeId],
      });
      onSuccess?.();
    },
  });
};

export default useRevokeStockMovementMutation;
