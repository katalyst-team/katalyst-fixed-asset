import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  createInsurancePolicyService,
  type InsurancePolicyPayload,
} from "@/services/fixed-assets/createInsurancePolicyService";

import { KEY_USE_GET_FA_INSURANCE } from "./useGetInsurancePoliciesQuery";

interface UseCreateInsurancePolicyMutationParams {
  organizationId: string;
}

const useCreateInsurancePolicyMutation = ({
  organizationId,
}: UseCreateInsurancePolicyMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InsurancePolicyPayload) =>
      createInsurancePolicyService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_FA_INSURANCE(organizationId),
      });
      toast.success("Insurance policy created");
    },
  });
};

export default useCreateInsurancePolicyMutation;
