import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import { submitStockMovementService } from "@/services/stockMovement/submitStockMovementService";

import { KEY_USE_GET_STOCK_MOVEMENT_DATA } from "./useGetStockMovementDataQuery";

interface UseSubmitStockMovementMutationProps {
  onError?: (error: unknown) => void;
  onSuccess?: () => void;
}

const useSubmitStockMovementMutation = ({
  onError,
  onSuccess,
}: UseSubmitStockMovementMutationProps = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitStockMovementService,
    onError: (error) => {
      toastError(error);
      onError?.(error);
    },
    onSuccess: (_, { organizationId, storeId }) => {
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_STOCK_MOVEMENT_DATA(organizationId, storeId),
      });
      toast.success("Penerimaan log berhasil di-submit");
      onSuccess?.();
    },
  });
};

export default useSubmitStockMovementMutation;
