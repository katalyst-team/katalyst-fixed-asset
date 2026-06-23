import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  UpdateWorkOrderStatusResponse,
  updateWorkOrderStatusService,
} from "@/services/fixed-assets/updateWorkOrderStatusService";
import type { UpdateWorkOrderStatusRequest } from "@/types/fixed-assets";

interface UseUpdateWorkOrderStatusMutationParams {
  organizationId: string;
}

interface UpdateWorkOrderStatusVariables {
  data: UpdateWorkOrderStatusRequest;
  workOrderId: string;
}

const useUpdateWorkOrderStatusMutation = ({
  organizationId,
}: UseUpdateWorkOrderStatusMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateWorkOrderStatusResponse,
    Error,
    UpdateWorkOrderStatusVariables
  >({
    mutationFn: ({ data, workOrderId }) =>
      updateWorkOrderStatusService({ data, organizationId, workOrderId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Work order status updated");
      queryClient.invalidateQueries({
        queryKey: ["faMaintenance", organizationId],
      });
    },
  });
};

export default useUpdateWorkOrderStatusMutation;
