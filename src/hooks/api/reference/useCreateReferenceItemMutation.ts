import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  CreateReferenceItemResponse,
  createReferenceItemService,
} from "@/services/reference/createReferenceItemService";
import { CreateReferenceItemRequest } from "@/types/reference";

interface UseCreateReferenceItemMutationParams {
  groupId: string;
  organizationId: string;
}

const useCreateReferenceItemMutation = ({
  groupId,
  organizationId,
}: UseCreateReferenceItemMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateReferenceItemResponse,
    Error,
    CreateReferenceItemRequest & { store_id?: string }
  >({
    mutationFn: ({ store_id, ...data }) =>
      createReferenceItemService({ data, groupId, organizationId, store_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["referenceItems", organizationId, groupId],
      });
    },
  });
};

export default useCreateReferenceItemMutation;
