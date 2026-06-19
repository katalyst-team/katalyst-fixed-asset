import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  DeleteAttributeCollectionResponse,
  deleteAttributeCollectionService,
} from "@/services/attribute/collection/deleteAttributeCollectionService";

import { KEY_USE_GET_ATTRIBUTE_COLLECTIONS } from "./useGetAttributeCollectionsQuery";

const useDeleteAttributeCollectionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteAttributeCollectionResponse,
    Error,
    {
      organizationId: string;
      attributeCollectionId: string;
    }
  >({
    mutationFn: ({ organizationId, attributeCollectionId }) =>
      deleteAttributeCollectionService({
        attributeCollectionId,
        organizationId,
      }),
    onSuccess: (_, { organizationId }) => {
      // Invalidate and refetch the attribute collections list
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_ATTRIBUTE_COLLECTIONS(organizationId),
      });
    },
  });
};

export default useDeleteAttributeCollectionMutation;
