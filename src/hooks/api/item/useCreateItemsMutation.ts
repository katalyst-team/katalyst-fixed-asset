import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  CreateItemsResponse,
  createItemsService,
} from "@/services/item/createItemsService";

import { KEY_USE_GET_ITEMS_MAP } from "../item/useGetItemsMapQuery";
import { KEY_USE_GET_STOCK_MOVEMENT_DATA } from "../stockMovement/useGetStockMovementDataQuery";

interface UseCreateItemsMutationParams {
  data: { items: { quantity: number; sku_id: string }[] };
  organizationId: string;
  storeId: string;
}

interface UseCreateItemsMutationProps {
  onSuccess?: (data: CreateItemsResponse) => void;
  onError?: (error: Error) => void;
}

const useCreateItemsMutation = ({
  onSuccess,
  onError,
}: UseCreateItemsMutationProps = {}) => {
  const queryClient = useQueryClient();

  return useMutation<CreateItemsResponse, Error, UseCreateItemsMutationParams>({
    mutationFn: async ({ data, organizationId, storeId }) => {
      const response = await createItemsService({
        data,
        organizationId,
        storeId,
      });
      return response.data;
    },
    onError: (error) => {
      toastError(error);
      onError?.(error);
    },
    onSuccess: async (data, { organizationId, storeId }) => {
      await queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_ITEMS_MAP(organizationId, storeId, {}),
      });
      await queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_STOCK_MOVEMENT_DATA(
          organizationId,
          storeId,
          {},
        ),
      });
      if (onSuccess) {
        onSuccess(data);
      } else {
        toast.success("Items created successfully");
      }
    },
  });
};

export default useCreateItemsMutation;
