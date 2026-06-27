import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import { escalateRequestService } from "@/services/fixed-assets/escalateRequestService";

import { KEY_USE_GET_FA_APPROVAL_REQUESTS } from "./useGetApprovalRequestsQuery";

interface UseEscalateRequestMutationParams {
  organizationId: string;
}

const useEscalateRequestMutation = ({
  organizationId,
}: UseEscalateRequestMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      escalateToId: string;
      reason: string;
      requestId: string;
    }) =>
      escalateRequestService({
        escalateToId: params.escalateToId,
        organizationId,
        reason: params.reason,
        requestId: params.requestId,
      }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_FA_APPROVAL_REQUESTS(organizationId),
      });
      toast.success("Request escalated");
    },
  });
};

export default useEscalateRequestMutation;
