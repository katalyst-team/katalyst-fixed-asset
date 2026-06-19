import { useMutation, useQueryClient } from "@tanstack/react-query";

import { validateStockMovementService } from "@/services/stockMovement/validateStockMovementService";

interface UseValidateStockMovementMutationProps {
  onError?: (error: unknown) => void;
  onSuccess?: () => void;
}

const useValidateStockMovementMutation = ({
  onError,
  onSuccess,
}: UseValidateStockMovementMutationProps = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: validateStockMovementService,
    onError,
    onSuccess: (_, { organizationId, storeId }) => {
      queryClient.invalidateQueries({
        queryKey: ["stockMovementData", organizationId, storeId],
      });
      onSuccess?.();
    },
  });
};

export default useValidateStockMovementMutation;
