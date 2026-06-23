import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  CreateTransferResponse,
  createTransferService,
} from "@/services/fixed-assets/createTransferService";
import type { CreateTransferRequest } from "@/types/fixed-assets";

interface UseCreateTransferMutationParams {
  organizationId: string;
}

const useCreateTransferMutation = ({
  organizationId,
}: UseCreateTransferMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<CreateTransferResponse, Error, CreateTransferRequest>({
    mutationFn: (data) => createTransferService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Transfer created successfully");
      queryClient.invalidateQueries({
        queryKey: ["faTransfers", organizationId],
      });
    },
  });
};

export default useCreateTransferMutation;
