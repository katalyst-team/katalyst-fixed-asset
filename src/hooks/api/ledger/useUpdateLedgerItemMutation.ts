import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import { updateLedgerItemService } from "@/services/ledger/updateLedgerItemService";
import { UpdateLedgerItemParams } from "@/types/ledger";

import { KEY_USE_GET_LEDGER_DATA } from "./useGetLedgerDataQuery";
import { KEY_USE_GET_LEDGER_DETAIL } from "./useGetLedgerDetailQuery";

interface UseUpdateLedgerItemMutationParams {
  params: UpdateLedgerItemParams;
  organizationId: string;
  storeId: string;
  itemId: string;
}

export const USE_UPDATE_LEDGER_ITEM_MUTATION_KEY = () => ["updateLedgerItem"];

const useUpdateLedgerItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, UseUpdateLedgerItemMutationParams>({
    mutationFn: ({ params, organizationId, storeId, itemId }) =>
      updateLedgerItemService({
        itemId,
        organizationId,
        params,
        storeId,
      }),
    mutationKey: USE_UPDATE_LEDGER_ITEM_MUTATION_KEY(),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: (_, { organizationId, storeId, itemId }) => {
      // Invalidate queries to refetch data
      toast.success("Item updated successfully");
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_LEDGER_DATA(organizationId, storeId),
      });
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_LEDGER_DETAIL(organizationId, storeId, itemId),
      });
    },
  });
};

export default useUpdateLedgerItemMutation;
