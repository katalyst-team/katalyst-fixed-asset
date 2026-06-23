import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  BulkUpdateAssetResponse,
  bulkUpdateAssetService,
} from "@/services/fixed-assets/bulkUpdateAssetService";
import type { BulkUpdateAssetRequest } from "@/types/fixed-assets";

interface UseBulkUpdateAssetMutationParams {
  organizationId: string;
}

const useBulkUpdateAssetMutation = ({
  organizationId,
}: UseBulkUpdateAssetMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<BulkUpdateAssetResponse, Error, BulkUpdateAssetRequest>({
    mutationFn: (data) => bulkUpdateAssetService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Assets updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["faAssetRegister", organizationId],
      });
    },
  });
};

export default useBulkUpdateAssetMutation;
