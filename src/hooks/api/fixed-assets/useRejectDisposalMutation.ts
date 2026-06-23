import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  RejectDisposalResponse,
  rejectDisposalService,
} from "@/services/fixed-assets/rejectDisposalService";

interface UseRejectDisposalMutationParams {
  organizationId: string;
}

interface RejectDisposalVariables {
  disposalId: string;
  reason: string;
}

const useRejectDisposalMutation = ({
  organizationId,
}: UseRejectDisposalMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    RejectDisposalResponse,
    Error,
    RejectDisposalVariables
  >({
    mutationFn: ({ disposalId, reason }) =>
      rejectDisposalService({
        data: { reason },
        disposalId,
        organizationId,
      }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Disposal rejected");
      queryClient.invalidateQueries({
        queryKey: ["faDisposals", organizationId],
      });
    },
  });
};

export default useRejectDisposalMutation;
