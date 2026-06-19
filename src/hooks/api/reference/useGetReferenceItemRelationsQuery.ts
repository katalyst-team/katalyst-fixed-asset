import { useQuery } from "@tanstack/react-query";

import {
  GetReferenceItemRelationsResponse,
  getReferenceItemRelationsService,
} from "@/services/reference/getReferenceItemRelationsService";

interface UseGetReferenceItemRelationsQueryParams {
  enabled?: boolean;
  groupId: string;
  itemId: string;
  organizationId: string;
}

export const KEY_USE_GET_REFERENCE_ITEM_RELATIONS = (
  organizationId: string,
  groupId: string,
  itemId: string
) => ["referenceItemRelations", organizationId, groupId, itemId];

const useGetReferenceItemRelationsQuery = ({
  enabled = true,
  groupId,
  itemId,
  organizationId,
}: UseGetReferenceItemRelationsQueryParams) => {
  return useQuery<GetReferenceItemRelationsResponse, Error>({
    enabled: Boolean(organizationId && groupId && itemId && enabled),
    queryFn: () =>
      getReferenceItemRelationsService({ groupId, itemId, organizationId }),
    queryKey: KEY_USE_GET_REFERENCE_ITEM_RELATIONS(
      organizationId,
      groupId,
      itemId
    ),
    staleTime: 30 * 1000,
  });
};

export default useGetReferenceItemRelationsQuery;
