import { useQuery } from "@tanstack/react-query";

import {
  GetAttributeCollectionFiltersParams,
  GetAttributeCollectionResponse,
  getAttributeCollectionService,
} from "@/services/attribute/collection/getAttributeCollectionService";

interface UseGetAttributeCollectionQueryParams {
  organizationId: string;
  attributeCollectionId: string;
  enabled?: boolean;
  filters?: GetAttributeCollectionFiltersParams;
}

export const KEY_USE_GET_ATTRIBUTE_COLLECTION = (
  organizationId: string,
  attributeCollectionId: string
) => ["attributeCollection", organizationId, attributeCollectionId];

const useGetAttributeCollectionQuery = ({
  organizationId,
  attributeCollectionId,
  filters,
  enabled = true,
}: UseGetAttributeCollectionQueryParams) => {
  return useQuery<GetAttributeCollectionResponse, Error>({
    enabled: Boolean(organizationId && attributeCollectionId && enabled),
    queryFn: () =>
      getAttributeCollectionService({
        attributeCollectionId,
        filters,
        organizationId,
      }),
    queryKey: KEY_USE_GET_ATTRIBUTE_COLLECTION(
      organizationId,
      attributeCollectionId
    ),
    staleTime: 60 * 1000,
  });
};

export default useGetAttributeCollectionQuery;
