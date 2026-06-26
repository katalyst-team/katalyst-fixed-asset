import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import { approveRequestService } from "@/services/fixed-assets/approveRequestService";

import { KEY_USE_GET_FA_APPROVAL_REQUESTS } from "./useGetApprovalRequestsQuery";

interface UseApproveRequestMutationParams {
  organizationId: string;
}

const useApproveRequestMutation = ({ organizationId }: UseApproveRequestMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { comment?: string; requestId: string }) =>
      approveRequestService({
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
      toast.success("Request approved");
    },
  });
};

export default useApproveRequestMutation;
