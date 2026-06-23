import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  CreateAssetResponse,
  createAssetService,
} from "@/services/fixed-assets/createAssetService";
import type { CreateAssetRequest } from "@/types/fixed-assets";

interface UseCreateAssetMutationParams {
  organizationId: string;
}

const useCreateAssetMutation = ({
  organizationId,
}: UseCreateAssetMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<CreateAssetResponse, Error, CreateAssetRequest>({
    mutationFn: (data) => createAssetService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Asset created successfully");
      queryClient.invalidateQueries({
        queryKey: ["faAssetRegister", organizationId],
      });
    },
  });
};

export default useCreateAssetMutation;
