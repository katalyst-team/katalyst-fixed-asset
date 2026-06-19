import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  CreateStockMovementWithItemsRequest,
  CreateStockMovementWithItemsResponse,
  createStockMovementWithItemsService,
} from "@/services/stockMovement/createStockMovementWithItemsService";

import { KEY_USE_GET_STOCK_MOVEMENT_DATA } from "./useGetStockMovementDataQuery";

interface UseCreateStockMovementWithItemsMutationParams {
  organizationId: string;
  storeId: string;
  data: CreateStockMovementWithItemsRequest;
}

export const USE_CREATE_STOCK_MOVEMENT_WITH_ITEMS_MUTATION_KEY = () => [
  "createStockMovementWithItems",
];

interface UseCreateStockMovementWithItemsMutationProps {
  onSuccess?: (data: CreateStockMovementWithItemsResponse) => void;
  onError?: (error: Error) => void;
}

const useCreateStockMovementWithItemsMutation = ({
  onSuccess,
  onError,
}: UseCreateStockMovementWithItemsMutationProps = {}) => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateStockMovementWithItemsResponse,
    Error,
    UseCreateStockMovementWithItemsMutationParams
  >({
    mutationFn: async ({ organizationId, storeId, data }) => {
      const response = await createStockMovementWithItemsService({
        data,
        organizationId,
        storeId,
      });
      return response.data;
    },
    mutationKey: USE_CREATE_STOCK_MOVEMENT_WITH_ITEMS_MUTATION_KEY(),
    onError: (error) => {
      toastError(error);
      onError?.(error);
    },
    onSuccess: async (data, { organizationId, storeId }) => {
      await queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_STOCK_MOVEMENT_DATA(organizationId, storeId, {}),
      });

      if (onSuccess) {
        onSuccess(data);
      } else {
        toast.success("Penerimaan log berhasil dibuat");
      }
    },
  });
};

export default useCreateStockMovementWithItemsMutation;
