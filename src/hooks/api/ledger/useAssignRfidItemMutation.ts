import { useMutation } from "@tanstack/react-query";

import { assignRfidItemService } from "@/services/ledger/assignRfidItemService";

interface UseAssignRfidItemMutationParams {
  organizationId: string;
  storeId: string;
  itemId: string;
  params: {
    action: "ADD" | "REMOVE";
    epc: string;
  };
}

const useAssignRfidItemMutation = () => {
  return useMutation({
    mutationFn: ({
      organizationId,
      storeId,
      itemId,
      params,
    }: UseAssignRfidItemMutationParams) =>
      assignRfidItemService({
        itemId,
        organizationId,
        params,
        storeId,
      }),
  });
};

export default useAssignRfidItemMutation;
