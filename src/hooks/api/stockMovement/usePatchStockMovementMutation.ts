import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  PatchStockMovementData,
  PatchStockMovementRequest,
  patchStockMovementService,
} from "@/services/stockMovement/patchStockMovementService";

import { KEY_USE_GET_STOCK_MOVEMENT_DATA } from "./useGetStockMovementDataQuery";
import { KEY_USE_GET_STOCK_MOVEMENT_DETAIL } from "./useGetStockMovementDetailQuery";

interface UsePatchStockMovementMutationParams {
  data: PatchStockMovementRequest;
  organizationId: string;
  stockMovementId: string;
  storeId: string;
}

interface UsePatchStockMovementMutationProps {
  onSuccess?: (data: PatchStockMovementData) => void;
  onError?: (error: Error) => void;
}

const usePatchStockMovementMutation = ({
  onSuccess,
  onError,
}: UsePatchStockMovementMutationProps = {}) => {
  const queryClient = useQueryClient();

  return useMutation<
    PatchStockMovementData,
    Error,
    UsePatchStockMovementMutationParams
  >({
    mutationFn: async ({ data, organizationId, stockMovementId, storeId }) => {
      const response = await patchStockMovementService({
        data,
        organizationId,
        stockMovementId,
        storeId,
      });
      return response.data;
    },
    onError: (error) => {
      toastError(error);
      onError?.(error);
    },
    onSuccess: async (data, { organizationId, storeId, stockMovementId }) => {
      await queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_STOCK_MOVEMENT_DATA(
          organizationId,
          storeId,
          {},
        ),
      });
      await queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_STOCK_MOVEMENT_DETAIL(
          organizationId,
          storeId,
          stockMovementId,
        ),
      });
      if (onSuccess) {
        onSuccess(data);
      } else {
        toast.success("Stock movement updated successfully");
      }
    },
  });
};

export default usePatchStockMovementMutation;
