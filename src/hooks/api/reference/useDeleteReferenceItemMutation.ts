import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  DeleteReferenceItemResponse,
  deleteReferenceItemService,
} from "@/services/reference/deleteReferenceItemService";


interface UseDeleteReferenceItemMutationParams {
  groupId: string;
  itemId: string;
  organizationId: string;
  store_id?: string;
}

const useDeleteReferenceItemMutation = ({
  groupId,
  itemId,
  organizationId,
}: UseDeleteReferenceItemMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<DeleteReferenceItemResponse, Error, void>({
    mutationFn: () =>
      deleteReferenceItemService({ groupId, itemId, organizationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["referenceItems", organizationId, groupId],
      });
    },
  });
};

export default useDeleteReferenceItemMutation;
