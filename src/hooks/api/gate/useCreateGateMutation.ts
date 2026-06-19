import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiResponse } from "@/services";
import { toastError } from "@/services";
import { createGateService } from "@/services/gate/createGateService";
import { CreateGatePayload, GateMutationResponse } from "@/types/gate";

interface UseCreateGateMutationParams {
  organizationId: string;
}

const useCreateGateMutation = ({
  organizationId,
}: UseCreateGateMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<GateMutationResponse>,
    Error,
    CreateGatePayload
  >({
    mutationFn: (payload) =>
      createGateService({ organizationId, payload }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Gate created successfully");
      queryClient.invalidateQueries({
        queryKey: ["gateList", organizationId],
      });
    },
  });
};

export default useCreateGateMutation;
