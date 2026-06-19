import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createLedgerItemService } from "@/services/ledger/createLedgerItemService";
import { CreateLedgerItemParams, LedgerIdResponse } from "@/types/ledger";

import { KEY_USE_GET_LEDGER_DATA } from "./useGetLedgerDataQuery";

interface UseCreateLedgerItemMutationParams {
  params: CreateLedgerItemParams;
  organizationId: string;
  storeId: string;
}

export const USE_CREATE_LEDGER_ITEM_MUTATION_KEY = () => ["createLedgerItem"];

interface useCreateLedgerItemMutationProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
const useCreateLedgerItemMutation = (
  props: useCreateLedgerItemMutationProps = {}
) => {
  const queryClient = useQueryClient();

  return useMutation<
    LedgerIdResponse,
    Error,
    UseCreateLedgerItemMutationParams
  >({
    mutationFn: ({ params, organizationId, storeId }) =>
      createLedgerItemService({
        organizationId,
        params,
        storeId,
      }),
    mutationKey: USE_CREATE_LEDGER_ITEM_MUTATION_KEY(),
    onSuccess: (_, { organizationId, storeId }) => {
      // Invalidate queries to refetch data
      return props.onSuccess
        ? props.onSuccess()
        : queryClient.invalidateQueries({
            queryKey: KEY_USE_GET_LEDGER_DATA(organizationId, storeId),
          });
    },
  });
};

export default useCreateLedgerItemMutation;
