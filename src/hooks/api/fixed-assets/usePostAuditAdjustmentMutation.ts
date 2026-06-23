import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  PostAuditAdjustmentResponse,
  postAuditAdjustmentService,
} from "@/services/fixed-assets/postAuditAdjustmentService";
import type { PostAuditAdjustmentRequest } from "@/types/fixed-assets";

interface UsePostAuditAdjustmentMutationParams {
  organizationId: string;
}

interface PostAuditAdjustmentVariables {
  auditId: string;
  data: PostAuditAdjustmentRequest;
}

const usePostAuditAdjustmentMutation = ({
  organizationId,
}: UsePostAuditAdjustmentMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    PostAuditAdjustmentResponse,
    Error,
    PostAuditAdjustmentVariables
  >({
    mutationFn: ({ auditId, data }) =>
      postAuditAdjustmentService({ auditId, data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Audit adjustment posted to GL");
      queryClient.invalidateQueries({
        queryKey: ["faAuditZones", organizationId],
      });
    },
  });
};

export default usePostAuditAdjustmentMutation;
