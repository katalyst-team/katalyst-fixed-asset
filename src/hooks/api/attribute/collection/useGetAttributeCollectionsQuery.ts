import { useQuery } from '@tanstack/react-query';

import {
  GetAttributeCollectionsResponse,
  getAttributeCollectionsService,
} from '@/services/attribute/collection/getAttributeCollectionsService';

interface UseGetAttributeCollectionsQueryParams {
  organizationId: string;
  store_id?: string;
  enabled?: boolean;
}

export const KEY_USE_GET_ATTRIBUTE_COLLECTIONS = (organizationId: string, store_id?: string) => [
  'attributeCollections',
  organizationId,
  store_id,
];

const useGetAttributeCollectionsQuery = ({
  organizationId,
  store_id,
  enabled = true,
}: UseGetAttributeCollectionsQueryParams) => {
  return useQuery<GetAttributeCollectionsResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getAttributeCollectionsService({ organizationId, store_id }),
    queryKey: KEY_USE_GET_ATTRIBUTE_COLLECTIONS(organizationId, store_id),
    staleTime: 60 * 1000,
  });
};

export default useGetAttributeCollectionsQuery;
