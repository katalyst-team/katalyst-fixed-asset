import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  type CreateApprovalRuleRequest,
  createApprovalRuleService,
} from "@/services/fixed-assets/createApprovalRuleService";

import { KEY_USE_GET_FA_APPROVAL_RULES } from "./useGetApprovalRulesQuery";

interface UseCreateApprovalRuleMutationParams {
  organizationId: string;
}

const useCreateApprovalRuleMutation = ({
  organizationId,
}: UseCreateApprovalRuleMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApprovalRuleRequest) =>
      createApprovalRuleService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_FA_APPROVAL_RULES(organizationId),
      });
      toast.success("Approval rule created");
    },
  });
};

export default useCreateApprovalRuleMutation;
