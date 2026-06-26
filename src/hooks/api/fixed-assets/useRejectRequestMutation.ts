import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import { rejectRequestService } from "@/services/fixed-assets/rejectRequestService";

import { KEY_USE_GET_FA_APPROVAL_REQUESTS } from "./useGetApprovalRequestsQuery";

interface UseRejectRequestMutationParams {
  organizationId: string;
}

const useRejectRequestMutation = ({ organizationId }: UseRejectRequestMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { comment?: string; requestId: string }) =>
      rejectRequestService({
        comment: params.comment,
        organizationId,
        requestId: params.requestId,
      }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_FA_APPROVAL_REQUESTS(organizationId),
      });
      toast.success("Request rejected");
    },
  });
};

export default useRejectRequestMutation;
