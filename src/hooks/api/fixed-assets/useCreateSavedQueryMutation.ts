import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  CreateSavedQueryResponse,
  createSavedQueryService,
} from "@/services/fixed-assets/createSavedQueryService";
import type { CreateSavedQueryRequest } from "@/types/fixed-assets";

interface UseCreateSavedQueryMutationParams {
  organizationId: string;
}

const useCreateSavedQueryMutation = ({
  organizationId,
}: UseCreateSavedQueryMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateSavedQueryResponse,
    Error,
    CreateSavedQueryRequest
  >({
    mutationFn: (data) =>
      createSavedQueryService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Query saved");
      queryClient.invalidateQueries({
        queryKey: ["faSavedQueries"],
      });
    },
  });
};

export default useCreateSavedQueryMutation;
