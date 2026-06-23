import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  CreateWorkOrderResponse,
  createWorkOrderService,
} from "@/services/fixed-assets/createWorkOrderService";
import type { CreateWorkOrderRequest } from "@/types/fixed-assets";

interface UseCreateWorkOrderMutationParams {
  organizationId: string;
}

const useCreateWorkOrderMutation = ({
  organizationId,
}: UseCreateWorkOrderMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<CreateWorkOrderResponse, Error, CreateWorkOrderRequest>({
    mutationFn: (data) => createWorkOrderService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Work order created successfully");
      queryClient.invalidateQueries({
        queryKey: ["faMaintenance", organizationId],
      });
    },
  });
};

export default useCreateWorkOrderMutation;
