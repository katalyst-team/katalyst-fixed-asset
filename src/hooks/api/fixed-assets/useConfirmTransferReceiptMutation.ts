import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  ConfirmTransferReceiptResponse,
  confirmTransferReceiptService,
} from "@/services/fixed-assets/confirmTransferReceiptService";

interface UseConfirmTransferReceiptMutationParams {
  organizationId: string;
}

const useConfirmTransferReceiptMutation = ({
  organizationId,
}: UseConfirmTransferReceiptMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    ConfirmTransferReceiptResponse,
    Error,
    { transferId: string }
  >({
    mutationFn: ({ transferId }) =>
      confirmTransferReceiptService({ organizationId, transferId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Transfer receipt confirmed");
      queryClient.invalidateQueries({
        queryKey: ["faTransfers", organizationId],
      });
    },
  });
};

export default useConfirmTransferReceiptMutation;
