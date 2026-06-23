import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  ReturnCheckOutResponse,
  returnCheckOutService,
} from "@/services/fixed-assets/returnCheckOutService";
import type { ReturnCheckOutRequest } from "@/types/fixed-assets";

interface UseReturnCheckOutMutationParams {
  organizationId: string;
}

interface ReturnCheckOutVariables {
  checkOutId: string;
  data: ReturnCheckOutRequest;
}

const useReturnCheckOutMutation = ({
  organizationId,
}: UseReturnCheckOutMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    ReturnCheckOutResponse,
    Error,
    ReturnCheckOutVariables
  >({
    mutationFn: ({ checkOutId, data }) =>
      returnCheckOutService({ checkOutId, data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Asset returned successfully");
      queryClient.invalidateQueries({
        queryKey: ["faCheckOuts", organizationId],
      });
    },
  });
};

export default useReturnCheckOutMutation;
