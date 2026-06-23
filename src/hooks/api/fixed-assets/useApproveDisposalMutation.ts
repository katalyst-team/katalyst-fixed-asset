import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  ApproveDisposalResponse,
  approveDisposalService,
} from "@/services/fixed-assets/approveDisposalService";

interface UseApproveDisposalMutationParams {
  organizationId: string;
}

const useApproveDisposalMutation = ({
  organizationId,
}: UseApproveDisposalMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<ApproveDisposalResponse, Error, { disposalId: string }>({
    mutationFn: ({ disposalId }) =>
      approveDisposalService({ disposalId, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Disposal approved");
      queryClient.invalidateQueries({
        queryKey: ["faDisposals", organizationId],
      });
    },
  });
};

export default useApproveDisposalMutation;
