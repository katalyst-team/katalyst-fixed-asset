import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiResponse } from "@/services";
import { toastError } from "@/services";
import { createEdgeConfigService } from "@/services/edge-config/createEdgeConfigService";
import { CreateEdgeConfigPayload, EdgeConfigMutationResponse } from "@/types/edge-config";


interface UseCreateEdgeConfigMutationParams {
  organizationId: string;
}

const useCreateEdgeConfigMutation = ({
  organizationId,
}: UseCreateEdgeConfigMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<EdgeConfigMutationResponse>,
    Error,
    CreateEdgeConfigPayload
  >({
    mutationFn: (payload) =>
      createEdgeConfigService({ organizationId, payload }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Edge Config created successfully");
      queryClient.invalidateQueries({
        queryKey: ["edgeConfigData", organizationId],
      });
    },
  });
};

export default useCreateEdgeConfigMutation;
