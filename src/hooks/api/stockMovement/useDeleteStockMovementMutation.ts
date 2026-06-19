import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  DeleteStockMovementResponse,
  deleteStockMovementService,
} from "@/services/stockMovement/deleteStockMovementService";

import { KEY_USE_GET_STOCK_MOVEMENT_DATA } from "./useGetStockMovementDataQuery";

interface UseDeleteStockMovementMutationParams {
  organizationId: string;
  storeId: string;
  itemIds: string[];
  stockMovementId: string;
}

export const USE_DELETE_STOCK_MOVEMENT_MUTATION_KEY = () => [
  "deleteStockMovement",
];

interface UseDeleteStockMovementMutationProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const useDeleteStockMovementMutation = ({
  onSuccess,
  onError,
}: UseDeleteStockMovementMutationProps = {}) => {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteStockMovementResponse,
    Error,
    UseDeleteStockMovementMutationParams
  >({
    mutationFn: ({ organizationId, storeId, itemIds, stockMovementId }) =>
      deleteStockMovementService({
        itemIds,
        organizationId,
        stockMovementId,
        storeId,
      }),
    mutationKey: USE_DELETE_STOCK_MOVEMENT_MUTATION_KEY(),
    onError: (error) => {
      toastError(error);
      onError?.(error);
    },
    onSuccess: async (_, { organizationId, storeId }) => {
      // Invalidate stock movement data queries to refetch the ledger list
      if (onSuccess) {
        onSuccess();
      } else {
        await queryClient.invalidateQueries({
          queryKey: KEY_USE_GET_STOCK_MOVEMENT_DATA(
            organizationId,
            storeId,
            {}
          ),
        });
        toast.success("Stock movement deleted successfully");
      }
    },
  });
};

export default useDeleteStockMovementMutation;
