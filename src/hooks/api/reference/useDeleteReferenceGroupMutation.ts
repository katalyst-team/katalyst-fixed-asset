import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  DeleteReferenceGroupResponse,
  deleteReferenceGroupService,
} from "@/services/reference/deleteReferenceGroupService";


interface UseDeleteReferenceGroupMutationParams {
  groupId: string;
  organizationId: string;
  store_id?: string;
}

const useDeleteReferenceGroupMutation = ({
  groupId,
  organizationId,
}: UseDeleteReferenceGroupMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<DeleteReferenceGroupResponse, Error, void>({
    mutationFn: () => deleteReferenceGroupService({ groupId, organizationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["referenceGroups", organizationId],
      });
    },
  });
};

export default useDeleteReferenceGroupMutation;
