import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { postSkuDataService } from "../../../services/sku/postSkuDataService";
import { CreateSkuParams } from "../../../types/sku";

export const useCreateSkuDataMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateSkuParams) => postSkuDataService(params),
    onSuccess: (data, variables) => {
      toast.success("SKU created successfully");
      queryClient.invalidateQueries({
        queryKey: ["skus", variables.organization_id],
      });
    },
  });
};
