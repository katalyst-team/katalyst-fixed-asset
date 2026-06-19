import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiResponse } from "@/services";
import { toastError } from "@/services";
import { deleteEdgeConfigService } from "@/services/edge-config/deleteEdgeConfigService";
import { EdgeConfigMutationResponse } from "@/types/edge-config";

import { KEY_USE_GET_EDGE_CONFIG_DATA } from "./useGetEdgeConfigDataQuery";

interface UseDeleteEdgeConfigMutationParams {
  organizationId: string;
}

const useDeleteEdgeConfigMutation = ({
  organizationId,
}: UseDeleteEdgeConfigMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<EdgeConfigMutationResponse>,
    Error,
    { ids: string[] }
  >({
    mutationFn: ({ ids }) =>
      deleteEdgeConfigService({ edgeConfigId: ids[0], organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Edge Config deleted successfully");
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_EDGE_CONFIG_DATA(organizationId, {}),
      });
    },
  });
};

export default useDeleteEdgeConfigMutation;
