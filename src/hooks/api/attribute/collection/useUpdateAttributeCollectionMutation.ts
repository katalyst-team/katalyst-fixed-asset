import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  UpdateAttributeCollectionResponse,
  updateAttributeCollectionService,
} from "@/services/attribute/collection/updateAttributeCollectionService";
import { UpdateAttributeCollectionRequest } from "@/types/attributeCollection";

import { KEY_USE_GET_ATTRIBUTE_COLLECTION } from "./useGetAttributeCollectionQuery";
import { KEY_USE_GET_ATTRIBUTE_COLLECTIONS } from "./useGetAttributeCollectionsQuery";

const useUpdateAttributeCollectionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateAttributeCollectionResponse,
    Error,
    {
      organizationId: string;
      attributeCollectionId: string;
      payload: UpdateAttributeCollectionRequest;
    }
  >({
    mutationFn: ({ organizationId, attributeCollectionId, payload }) =>
      updateAttributeCollectionService({
        attributeCollectionId,
        organizationId,
        payload,
      }),
    onSuccess: (_, { organizationId, attributeCollectionId }) => {
      // Invalidate and refetch the specific attribute collection
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_ATTRIBUTE_COLLECTION(
          organizationId,
          attributeCollectionId
        ),
      });
      // Also invalidate the collections list
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_ATTRIBUTE_COLLECTIONS(organizationId),
      });
    },
  });
};

export default useUpdateAttributeCollectionMutation;
