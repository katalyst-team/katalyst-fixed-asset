import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiResponse } from "@/services";
import { toastError } from "@/services";
import { deleteGateService } from "@/services/gate/deleteGateService";
import { GateMutationResponse } from "@/types/gate";

import { KEY_USE_GET_GATE_LIST } from "./useGetGateListQuery";

interface UseDeleteGateMutationParams {
  organizationId: string;
}

const useDeleteGateMutation = ({
  organizationId,
}: UseDeleteGateMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<GateMutationResponse>,
    Error,
    { ids: string[] }
  >({
    mutationFn: ({ ids }) =>
      deleteGateService({ gateId: ids[0], organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Gate deleted successfully");
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_GATE_LIST(organizationId, {}),
      });
    },
  });
};

export default useDeleteGateMutation;
