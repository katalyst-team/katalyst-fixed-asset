import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  GenerateBastResponse,
  generateBastService,
} from "@/services/fixed-assets/generateBastService";

interface UseGenerateBastMutationParams {
  organizationId: string;
}

const useGenerateBastMutation = ({
  organizationId,
}: UseGenerateBastMutationParams) => {
  return useMutation<GenerateBastResponse, Error, { disposalId: string }>({
    mutationFn: ({ disposalId }) =>
      generateBastService({ disposalId, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("BAST document generated");
    },
  });
};

export default useGenerateBastMutation;
