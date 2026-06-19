import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiResponse } from "@/services";
import { toastError } from "@/services";
import { updateEdgeConfigService } from "@/services/edge-config/updateEdgeConfigService";
import { EdgeConfigMutationResponse, UpdateEdgeConfigPayload } from "@/types/edge-config";


interface UseUpdateEdgeConfigMutationParams {
  edgeConfigId: string;
  organizationId: string;
}

const useUpdateEdgeConfigMutation = ({
  edgeConfigId,
  organizationId,
}: UseUpdateEdgeConfigMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<EdgeConfigMutationResponse>,
    Error,
    UpdateEdgeConfigPayload
  >({
    mutationFn: (payload) =>
      updateEdgeConfigService({ edgeConfigId, organizationId, payload }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Edge Config updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["edgeConfigData", organizationId],
      });
    },
  });
};

export default useUpdateEdgeConfigMutation;
