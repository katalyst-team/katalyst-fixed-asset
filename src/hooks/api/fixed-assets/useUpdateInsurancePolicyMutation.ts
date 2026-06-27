import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  type UpdateInsurancePolicyPayload,
  updateInsurancePolicyService,
} from "@/services/fixed-assets/updateInsurancePolicyService";

import { KEY_USE_GET_FA_INSURANCE } from "./useGetInsurancePoliciesQuery";

interface UseUpdateInsurancePolicyMutationParams {
  organizationId: string;
}

const useUpdateInsurancePolicyMutation = ({
  organizationId,
}: UseUpdateInsurancePolicyMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { data: UpdateInsurancePolicyPayload; policyId: string }) =>
      updateInsurancePolicyService({
        data: params.data,
        organizationId,
        policyId: params.policyId,
      }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_FA_INSURANCE(organizationId),
      });
      toast.success("Insurance policy updated");
    },
  });
};

export default useUpdateInsurancePolicyMutation;
