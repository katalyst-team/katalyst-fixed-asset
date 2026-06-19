import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  CreateAttributeCollectionResponse,
  createAttributeCollectionService,
} from "@/services/attribute/collection/createAttributeCollectionService";
import { CreateAttributeCollectionRequest } from "@/types/attributeCollection";

import { KEY_USE_GET_ATTRIBUTE_COLLECTIONS } from "./useGetAttributeCollectionsQuery";

const useCreateAttributeCollectionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateAttributeCollectionResponse,
    Error,
    { organizationId: string; payload: CreateAttributeCollectionRequest }
  >({
    mutationFn: ({ organizationId, payload }) =>
      createAttributeCollectionService({ organizationId, payload }),
    onSuccess: (_, { organizationId }) => {
      // Invalidate and refetch the attribute collections list
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_ATTRIBUTE_COLLECTIONS(organizationId),
      });
    },
  });
};

export default useCreateAttributeCollectionMutation;
