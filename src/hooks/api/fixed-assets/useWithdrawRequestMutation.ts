import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import { withdrawRequestService } from "@/services/fixed-assets/withdrawRequestService";

import { KEY_USE_GET_FA_APPROVAL_REQUESTS } from "./useGetApprovalRequestsQuery";

interface UseWithdrawRequestMutationParams {
  organizationId: string;
}

const useWithdrawRequestMutation = ({
  organizationId,
}: UseWithdrawRequestMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { comment?: string; requestId: string }) =>
      withdrawRequestService({
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
      toast.success("Request withdrawn");
    },
  });
};

export default useWithdrawRequestMutation;
