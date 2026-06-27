import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  type CreatePredictiveModelRequest,
  createPredictiveModelService,
} from "@/services/fixed-assets/createPredictiveModelService";

import { KEY_USE_GET_FA_PREDICTIVE_MODELS } from "./useGetPredictiveModelsQuery";

interface UseCreatePredictiveModelMutationParams {
  organizationId: string;
}

const useCreatePredictiveModelMutation = ({
  organizationId,
}: UseCreatePredictiveModelMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePredictiveModelRequest) =>
      createPredictiveModelService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_FA_PREDICTIVE_MODELS(organizationId),
      });
      toast.success("Predictive model created");
    },
  });
};

export default useCreatePredictiveModelMutation;
