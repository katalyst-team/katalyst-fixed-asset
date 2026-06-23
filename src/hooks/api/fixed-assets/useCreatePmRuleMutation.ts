import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  CreatePmRuleResponse,
  createPmRuleService,
} from "@/services/fixed-assets/createPmRuleService";
import type { CreatePmRuleRequest } from "@/types/fixed-assets";

interface UseCreatePmRuleMutationParams {
  organizationId: string;
}

const useCreatePmRuleMutation = ({
  organizationId,
}: UseCreatePmRuleMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<CreatePmRuleResponse, Error, CreatePmRuleRequest>({
    mutationFn: (data) => createPmRuleService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("PM rule created successfully");
      queryClient.invalidateQueries({
        queryKey: ["faMaintenance", organizationId],
      });
    },
  });
};

export default useCreatePmRuleMutation;
