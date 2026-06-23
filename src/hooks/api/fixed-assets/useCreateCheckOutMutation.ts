import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  CreateCheckOutResponse,
  createCheckOutService,
} from "@/services/fixed-assets/createCheckOutService";
import type { CreateCheckOutRequest } from "@/types/fixed-assets";

interface UseCreateCheckOutMutationParams {
  organizationId: string;
}

const useCreateCheckOutMutation = ({
  organizationId,
}: UseCreateCheckOutMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<CreateCheckOutResponse, Error, CreateCheckOutRequest>({
    mutationFn: (data) => createCheckOutService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Asset checked out successfully");
      queryClient.invalidateQueries({
        queryKey: ["faCheckOuts", organizationId],
      });
    },
  });
};

export default useCreateCheckOutMutation;
