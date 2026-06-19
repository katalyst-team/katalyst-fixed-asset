import { useQuery } from "@tanstack/react-query";

import {
  GetReferenceGroupByIdResponse,
  getReferenceGroupByIdService,
} from "@/services/reference/getReferenceGroupByIdService";

interface UseGetReferenceGroupByIdQueryParams {
  enabled?: boolean;
  groupId: string;
  organizationId: string;
}

export const KEY_USE_GET_REFERENCE_GROUP_BY_ID = (
  organizationId: string,
  groupId: string
) => ["referenceGroupById", organizationId, groupId];

const useGetReferenceGroupByIdQuery = ({
  enabled = true,
  groupId,
  organizationId,
}: UseGetReferenceGroupByIdQueryParams) => {
  return useQuery<GetReferenceGroupByIdResponse, Error>({
    enabled: Boolean(organizationId && groupId && enabled),
    queryFn: () => getReferenceGroupByIdService({ groupId, organizationId }),
    queryKey: KEY_USE_GET_REFERENCE_GROUP_BY_ID(organizationId, groupId),
    staleTime: 5 * 60 * 1000,
  });
};

export default useGetReferenceGroupByIdQuery;
