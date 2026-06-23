import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  SubmitPreUseCheckResponse,
  submitPreUseCheckService,
} from "@/services/fixed-assets/submitPreUseCheckService";
import type { SubmitPreUseCheckRequest } from "@/types/fixed-assets";

interface UseSubmitPreUseCheckMutationParams {
  organizationId: string;
}

const useSubmitPreUseCheckMutation = ({
  organizationId,
}: UseSubmitPreUseCheckMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    SubmitPreUseCheckResponse,
    Error,
    SubmitPreUseCheckRequest
  >({
    mutationFn: (data) => submitPreUseCheckService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Pre-use inspection submitted");
      queryClient.invalidateQueries({
        queryKey: ["faMaintenance", organizationId],
      });
    },
  });
};

export default useSubmitPreUseCheckMutation;
