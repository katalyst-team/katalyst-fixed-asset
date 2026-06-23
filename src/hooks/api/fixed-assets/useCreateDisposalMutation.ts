import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  CreateDisposalResponse,
  createDisposalService,
} from "@/services/fixed-assets/createDisposalService";
import type { CreateDisposalRequest } from "@/types/fixed-assets";

interface UseCreateDisposalMutationParams {
  organizationId: string;
}

const useCreateDisposalMutation = ({
  organizationId,
}: UseCreateDisposalMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<CreateDisposalResponse, Error, CreateDisposalRequest>({
    mutationFn: (data) => createDisposalService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Disposal request created");
      queryClient.invalidateQueries({
        queryKey: ["faDisposals", organizationId],
      });
    },
  });
};

export default useCreateDisposalMutation;
