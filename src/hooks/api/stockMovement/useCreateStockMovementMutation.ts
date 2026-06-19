import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  CreateStockMovementRequest,
  CreateStockMovementResponse,
  createStockMovementService,
} from "@/services/stockMovement/createStockMovementService";

import { KEY_USE_GET_STOCK_MOVEMENT_DATA } from "./useGetStockMovementDataQuery";

interface UseCreateStockMovementMutationParams {
  organizationId: string;
  storeId: string;
  sectionId: string;
  data: CreateStockMovementRequest;
}

export const USE_CREATE_STOCK_MOVEMENT_MUTATION_KEY = () => [
  "createStockMovement",
];

interface UseCreateStockMovementMutationProps {
  onSuccess?: (data: CreateStockMovementResponse) => void;
  onError?: (error: Error) => void;
}

const useCreateStockMovementMutation = ({
  onSuccess,
  onError,
}: UseCreateStockMovementMutationProps = {}) => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateStockMovementResponse,
    Error,
    UseCreateStockMovementMutationParams
  >({
    mutationFn: async ({ organizationId, storeId, sectionId, data }) => {
      const response = await createStockMovementService({
        data,
        organizationId,
        sectionId,
        storeId,
      });
      return response.data;
    },
    mutationKey: USE_CREATE_STOCK_MOVEMENT_MUTATION_KEY(),
    onError: (error) => {
      toastError(error);
      onError?.(error);
    },
    onSuccess: async (data, { organizationId, storeId }) => {
      // Invalidate stock movement data queries to refetch the updated list
      await queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_STOCK_MOVEMENT_DATA(organizationId, storeId, {}),
      });

      if (onSuccess) {
        onSuccess(data);
      } else {
        toast.success("Stock movement created successfully");
      }
    },
  });
};

export default useCreateStockMovementMutation;
