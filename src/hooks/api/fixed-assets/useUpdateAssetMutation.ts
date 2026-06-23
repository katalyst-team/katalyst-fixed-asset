import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  UpdateAssetResponse,
  updateAssetService,
} from "@/services/fixed-assets/updateAssetService";
import type { FaAsset } from "@/types/fixed-assets";

interface UseUpdateAssetMutationParams {
  organizationId: string;
}

interface UpdateAssetVariables {
  assetId: string;
  data: Partial<FaAsset>;
}

const useUpdateAssetMutation = ({
  organizationId,
}: UseUpdateAssetMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<UpdateAssetResponse, Error, UpdateAssetVariables>({
    mutationFn: ({ assetId, data }) =>
      updateAssetService({ assetId, data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: (_, { assetId }) => {
      toast.success("Asset updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["faAssetRegister", organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["faAssetDetail", organizationId, assetId],
      });
    },
  });
};

export default useUpdateAssetMutation;
