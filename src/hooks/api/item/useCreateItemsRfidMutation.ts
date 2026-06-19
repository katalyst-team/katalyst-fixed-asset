import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  CreateItemsRfidParams,
  CreateItemsRfidResponse,
  createItemsRfidService,
} from "@/services/item";

import { KEY_USE_GET_ITEMS_MAP } from "./useGetItemsMapQuery";

export const USE_CREATE_ITEMS_RFID_MUTATION_KEY = () => ["createItemsRfid"];

interface UseCreateItemsRfidMutationProps {
  onSuccess?: (data: CreateItemsRfidResponse) => void;
  onError?: (error: Error) => void;
}

const useCreateItemsRfidMutation = ({
  onSuccess,
  onError,
}: UseCreateItemsRfidMutationProps = {}) => {
  const queryClient = useQueryClient();

  return useMutation<CreateItemsRfidResponse, Error, CreateItemsRfidParams>({
    mutationFn: async (params) => {
      return createItemsRfidService(params);
    },
    mutationKey: USE_CREATE_ITEMS_RFID_MUTATION_KEY(),
    onError: (error) => {
      toastError(error);
      onError?.(error);
    },
    onSuccess: async (data, { organizationId, storeId }) => {
      // Invalidate items map queries to refetch the updated list
      await queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_ITEMS_MAP(organizationId, storeId, {}),
      });

      if (onSuccess) {
        onSuccess(data);
      } else {
        toast.success("Operation completed successfully");
      }
    },
  });
};

export default useCreateItemsRfidMutation;
