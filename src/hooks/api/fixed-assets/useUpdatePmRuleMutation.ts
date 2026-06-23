import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  UpdatePmRuleResponse,
  updatePmRuleService,
} from "@/services/fixed-assets/updatePmRuleService";
import type { CreatePmRuleRequest } from "@/types/fixed-assets";

interface UseUpdatePmRuleMutationParams {
  organizationId: string;
}

interface UpdatePmRuleVariables {
  data: Partial<CreatePmRuleRequest>;
  pmRuleId: string;
}

const useUpdatePmRuleMutation = ({
  organizationId,
}: UseUpdatePmRuleMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<UpdatePmRuleResponse, Error, UpdatePmRuleVariables>({
    mutationFn: ({ data, pmRuleId }) =>
      updatePmRuleService({ data, organizationId, pmRuleId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("PM rule updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["faMaintenance", organizationId],
      });
    },
  });
};

export default useUpdatePmRuleMutation;
