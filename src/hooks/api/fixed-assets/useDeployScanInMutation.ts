import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  DeployScanInResponse,
  deployScanInService,
} from "@/services/fixed-assets/deployScanInService";
import type { DeployScanInRequest } from "@/types/fixed-assets";

interface UseDeployScanInMutationParams {
  organizationId: string;
}

const useDeployScanInMutation = ({
  organizationId,
}: UseDeployScanInMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<DeployScanInResponse, Error, DeployScanInRequest>({
    mutationFn: (data) => deployScanInService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Assets deployed successfully");
      queryClient.invalidateQueries({
        queryKey: ["faPO", organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["faAssetRegister", organizationId],
      });
    },
  });
};

export default useDeployScanInMutation;
