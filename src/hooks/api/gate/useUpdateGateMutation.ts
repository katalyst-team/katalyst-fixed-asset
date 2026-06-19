import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiResponse } from "@/services";
import { toastError } from "@/services";
import { updateGateService } from "@/services/gate/updateGateService";
import { GateMutationResponse, UpdateGatePayload } from "@/types/gate";

interface UseUpdateGateMutationParams {
  gateId: string;
  organizationId: string;
}

const useUpdateGateMutation = ({
  gateId,
  organizationId,
}: UseUpdateGateMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<GateMutationResponse>,
    Error,
    UpdateGatePayload
  >({
    mutationFn: (payload) =>
      updateGateService({ gateId, organizationId, payload }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Gate updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["gateList", organizationId],
      });
    },
  });
};

export default useUpdateGateMutation;
