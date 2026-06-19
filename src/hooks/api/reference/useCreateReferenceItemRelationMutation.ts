import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createReferenceItemRelationService } from "@/services/reference/createReferenceItemRelationService";
import { CreateReferenceItemRelationRequest } from "@/types/reference";

import { KEY_USE_GET_REFERENCE_ITEM_RELATIONS } from "./useGetReferenceItemRelationsQuery";

interface UseCreateReferenceItemRelationMutationParams {
  groupId: string;
  itemId: string;
  organizationId: string;
}

const useCreateReferenceItemRelationMutation = ({
  groupId,
  itemId,
  organizationId,
}: UseCreateReferenceItemRelationMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReferenceItemRelationRequest) =>
      createReferenceItemRelationService({ data, groupId, itemId, organizationId }),
    mutationKey: ["createReferenceItemRelation", organizationId, groupId, itemId],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_REFERENCE_ITEM_RELATIONS(organizationId, groupId, itemId),
      });
    },
  });
};

export default useCreateReferenceItemRelationMutation;
