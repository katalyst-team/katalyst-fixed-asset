import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  DeleteSavedQueryResponse,
  deleteSavedQueryService,
} from "@/services/fixed-assets/deleteSavedQueryService";

interface UseDeleteSavedQueryMutationParams {
  organizationId: string;
}

interface DeleteSavedQueryVariables {
  queryId: string;
}

const useDeleteSavedQueryMutation = ({
  organizationId,
}: UseDeleteSavedQueryMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteSavedQueryResponse,
    Error,
    DeleteSavedQueryVariables
  >({
    mutationFn: ({ queryId }) =>
      deleteSavedQueryService({ organizationId, queryId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Query deleted");
      queryClient.invalidateQueries({
        queryKey: ["faSavedQueries"],
      });
    },
  });
};

export default useDeleteSavedQueryMutation;
