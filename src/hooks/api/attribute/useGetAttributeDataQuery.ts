import { useQuery } from '@tanstack/react-query';

import {
  GetAttributeDataResponse,
  getAttributeDataService,
} from '@/services/attribute/getAttributeDataService';

interface UseGetAttributeDataQueryParams {
  cursor?: string;
  direction?: string;
  enabled?: boolean;
  limit?: number;
  organizationId: string;
  query?: string;
  store_id?: string;
  type?: string;
}

export const KEY_USE_GET_ATTRIBUTE_DATA = (organizationId: string, type?: string, cursor?: string, limit?: number, store_id?: string, direction?: string, query?: string) => [
  'attributeData',
  organizationId,
  type,
  cursor,
  limit,
  store_id,
  direction,
  query,
];

const useGetAttributeDataQuery = ({
  cursor,
  direction,
  enabled = true,
  limit,
  organizationId,
  query,
  store_id,
  type,
}: UseGetAttributeDataQueryParams) => {
  return useQuery<GetAttributeDataResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getAttributeDataService({ cursor, direction, limit, organizationId, query, store_id, type }),
    queryKey: KEY_USE_GET_ATTRIBUTE_DATA(organizationId, type, cursor, limit, store_id, direction, query),
    staleTime: 60 * 1000,
  });
};

export default useGetAttributeDataQuery;
