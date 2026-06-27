import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import { retrainPredictiveModelService } from "@/services/fixed-assets/retrainPredictiveModelService";

import { KEY_USE_GET_FA_PREDICTIVE_MODELS } from "./useGetPredictiveModelsQuery";

interface UseRetrainPredictiveModelMutationParams {
  organizationId: string;
}

const useRetrainPredictiveModelMutation = ({
  organizationId,
}: UseRetrainPredictiveModelMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (modelId: string) =>
      retrainPredictiveModelService({ modelId, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_FA_PREDICTIVE_MODELS(organizationId),
      });
      toast.success("Model retrain scheduled");
    },
  });
};

export default useRetrainPredictiveModelMutation;
