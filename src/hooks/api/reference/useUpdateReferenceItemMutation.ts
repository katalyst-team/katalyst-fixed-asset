import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  UpdateReferenceItemResponse,
  updateReferenceItemService,
} from "@/services/reference/updateReferenceItemService";
import { UpdateReferenceItemRequest } from "@/types/reference";

interface UseUpdateReferenceItemMutationParams {
  groupId: string;
  itemId: string;
  organizationId: string;
}

const useUpdateReferenceItemMutation = ({
  groupId,
  itemId,
  organizationId,
}: UseUpdateReferenceItemMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateReferenceItemResponse,
    Error,
    UpdateReferenceItemRequest & { store_id?: string }
  >({
    mutationFn: ({ store_id, ...data }) =>
      updateReferenceItemService({ data, groupId, itemId, organizationId, store_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["referenceItems", organizationId, groupId],
      });
    },
  });
};

export default useUpdateReferenceItemMutation;
