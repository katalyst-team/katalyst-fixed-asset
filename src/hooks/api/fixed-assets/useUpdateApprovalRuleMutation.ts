import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  type UpdateApprovalRuleRequest,
  updateApprovalRuleService,
} from "@/services/fixed-assets/updateApprovalRuleService";

import { KEY_USE_GET_FA_APPROVAL_RULES } from "./useGetApprovalRulesQuery";

interface UseUpdateApprovalRuleMutationParams {
  organizationId: string;
}

const useUpdateApprovalRuleMutation = ({
  organizationId,
}: UseUpdateApprovalRuleMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { data: UpdateApprovalRuleRequest; ruleId: string }) =>
      updateApprovalRuleService({
        data: params.data,
        organizationId,
        ruleId: params.ruleId,
      }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_FA_APPROVAL_RULES(organizationId),
      });
      toast.success("Approval rule updated");
    },
  });
};

export default useUpdateApprovalRuleMutation;
