import { useQuery } from "@tanstack/react-query";

import {
  GetReferenceItemsResponse,
  getReferenceItemsService,
} from "@/services/reference/getReferenceItemsService";

interface UseGetReferenceItemsQueryParams {
  cursor?: string;
  enabled?: boolean;
  groupId: string;
  limit?: number;
  organizationId: string;
  related_to?: string;
  store_id?: string;
}

export const KEY_USE_GET_REFERENCE_ITEMS = (
  organizationId: string,
  groupId: string,
  cursor?: string,
  limit?: number,
  store_id?: string
) => ["referenceItems", organizationId, groupId, cursor, limit, store_id];

const useGetReferenceItemsQuery = ({
  cursor,
  enabled = true,
  groupId,
  limit,
  organizationId,
  related_to,
  store_id,
}: UseGetReferenceItemsQueryParams) => {
  return useQuery<GetReferenceItemsResponse, Error>({
    enabled: Boolean(organizationId && groupId && enabled),
    queryFn: () =>
      getReferenceItemsService({
        cursor,
        groupId,
        limit,
        organizationId,
        related_to,
        store_id,
      }),
    queryKey: KEY_USE_GET_REFERENCE_ITEMS(
      organizationId,
      groupId,
      cursor,
      limit,
      store_id
    ),
    staleTime: 60 * 1000,
  });
};

export default useGetReferenceItemsQuery;
