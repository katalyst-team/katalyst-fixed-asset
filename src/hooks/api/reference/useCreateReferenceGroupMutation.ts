import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  CreateReferenceGroupResponse,
  createReferenceGroupService,
} from "@/services/reference/createReferenceGroupService";
import { CreateReferenceGroupRequest } from "@/types/reference";


interface UseCreateReferenceGroupMutationParams {
  organizationId: string;
  store_id?: string;
}

const useCreateReferenceGroupMutation = ({
  organizationId,
  store_id,
}: UseCreateReferenceGroupMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<CreateReferenceGroupResponse, Error, CreateReferenceGroupRequest>({
    mutationFn: (data) => createReferenceGroupService({ data, organizationId, store_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["referenceGroups", organizationId],
      });
    },
  });
};

export default useCreateReferenceGroupMutation;
