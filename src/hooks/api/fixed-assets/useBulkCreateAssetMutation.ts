import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  BulkCreateAssetResponse,
  bulkCreateAssetService,
} from "@/services/fixed-assets/bulkCreateAssetService";
import type { BulkCreateAssetRequest } from "@/types/fixed-assets";

interface UseBulkCreateAssetMutationParams {
  organizationId: string;
}

const useBulkCreateAssetMutation = ({
  organizationId,
}: UseBulkCreateAssetMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<BulkCreateAssetResponse, Error, BulkCreateAssetRequest>({
    mutationFn: (data) => bulkCreateAssetService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Assets imported successfully");
      queryClient.invalidateQueries({
        queryKey: ["faAssetRegister", organizationId],
      });
    },
  });
};

export default useBulkCreateAssetMutation;
