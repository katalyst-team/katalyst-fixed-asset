import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  ReviseDisposalResponse,
  reviseDisposalService,
} from "@/services/fixed-assets/reviseDisposalService";

interface UseReviseDisposalMutationParams {
  organizationId: string;
}

interface ReviseDisposalVariables {
  disposalId: string;
  notes: string;
}

const useReviseDisposalMutation = ({
  organizationId,
}: UseReviseDisposalMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    ReviseDisposalResponse,
    Error,
    ReviseDisposalVariables
  >({
    mutationFn: ({ disposalId, notes }) =>
      reviseDisposalService({
        data: { notes },
        disposalId,
        organizationId,
      }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Disposal returned for revision");
      queryClient.invalidateQueries({
        queryKey: ["faDisposals", organizationId],
      });
    },
  });
};

export default useReviseDisposalMutation;
