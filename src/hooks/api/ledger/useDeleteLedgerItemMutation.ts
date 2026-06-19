import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import { deleteLedgerItemService } from "@/services/ledger/deleteLedgerItemService";
import { LedgerIdResponse } from "@/types/ledger";

import { KEY_USE_GET_LEDGER_DATA } from "./useGetLedgerDataQuery";

interface UseDeleteLedgerItemMutationParams {
  organizationId: string;
  storeId: string;
  itemId: string;
}

export const USE_DELETE_LEDGER_ITEM_MUTATION_KEY = () => ["deleteLedgerItem"];

const useDeleteLedgerItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    LedgerIdResponse,
    Error,
    UseDeleteLedgerItemMutationParams
  >({
    mutationFn: ({ organizationId, storeId, itemId }) =>
      deleteLedgerItemService({
        itemId,
        organizationId,
        storeId,
      }),
    mutationKey: USE_DELETE_LEDGER_ITEM_MUTATION_KEY(),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: (_, { organizationId, storeId }) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_LEDGER_DATA(organizationId, storeId),
      });
      toast.success("Item deleted successfully");
    },
  });
};

export default useDeleteLedgerItemMutation;
