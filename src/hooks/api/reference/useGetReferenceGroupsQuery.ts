import { useQuery } from "@tanstack/react-query";

import {
  GetReferenceGroupsResponse,
  getReferenceGroupsService,
} from "@/services/reference/getReferenceGroupsService";

interface UseGetReferenceGroupsQueryParams {
  cursor?: string;
  enabled?: boolean;
  limit?: number;
  organizationId: string;
  store_id?: string;
}

export const KEY_USE_GET_REFERENCE_GROUPS = (
  organizationId: string,
  cursor?: string,
  limit?: number,
  store_id?: string
) => ["referenceGroups", organizationId, cursor, limit, store_id];

const useGetReferenceGroupsQuery = ({
  cursor,
  enabled = true,
  limit,
  organizationId,
  store_id,
}: UseGetReferenceGroupsQueryParams) => {
  return useQuery<GetReferenceGroupsResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () =>
      getReferenceGroupsService({ cursor, limit, organizationId, store_id }),
    queryKey: KEY_USE_GET_REFERENCE_GROUPS(organizationId, cursor, limit, store_id),
    staleTime: 60 * 1000,
  });
};

export default useGetReferenceGroupsQuery;
