import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteReferenceItemRelationService } from "@/services/reference/deleteReferenceItemRelationService";

import { KEY_USE_GET_REFERENCE_ITEM_RELATIONS } from "./useGetReferenceItemRelationsQuery";

interface UseDeleteReferenceItemRelationMutationParams {
  groupId: string;
  itemId: string;
  organizationId: string;
}

const useDeleteReferenceItemRelationMutation = ({
  groupId,
  itemId,
  organizationId,
}: UseDeleteReferenceItemRelationMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (relationId: string) =>
      deleteReferenceItemRelationService({
        groupId,
        itemId,
        organizationId,
        relationId,
      }),
    mutationKey: ["deleteReferenceItemRelation", organizationId, groupId, itemId],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_REFERENCE_ITEM_RELATIONS(organizationId, groupId, itemId),
      });
    },
  });
};

export default useDeleteReferenceItemRelationMutation;
