import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  UpdateReferenceGroupResponse,
  updateReferenceGroupService,
} from "@/services/reference/updateReferenceGroupService";
import { UpdateReferenceGroupRequest } from "@/types/reference";


interface UseUpdateReferenceGroupMutationParams {
  groupId: string;
  organizationId: string;
  store_id?: string;
}

const useUpdateReferenceGroupMutation = ({
  groupId,
  organizationId,
  store_id,
}: UseUpdateReferenceGroupMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<UpdateReferenceGroupResponse, Error, UpdateReferenceGroupRequest>({
    mutationFn: (data) =>
      updateReferenceGroupService({ data, groupId, organizationId, store_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["referenceGroups", organizationId],
      });
    },
  });
};

export default useUpdateReferenceGroupMutation;
