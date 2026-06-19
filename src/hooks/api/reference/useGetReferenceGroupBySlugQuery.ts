import { useQuery } from "@tanstack/react-query";

import {
  GetReferenceGroupBySlugResponse,
  getReferenceGroupBySlugService,
} from "@/services/reference/getReferenceGroupBySlugService";

interface UseGetReferenceGroupBySlugQueryParams {
  enabled?: boolean;
  organizationId: string;
  slug: string;
}

export const KEY_USE_GET_REFERENCE_GROUP_BY_SLUG = (
  organizationId: string,
  slug: string
) => ["referenceGroupBySlug", organizationId, slug];

const useGetReferenceGroupBySlugQuery = ({
  enabled = true,
  organizationId,
  slug,
}: UseGetReferenceGroupBySlugQueryParams) => {
  return useQuery<GetReferenceGroupBySlugResponse, Error>({
    enabled: Boolean(organizationId && slug && enabled),
    queryFn: () => getReferenceGroupBySlugService({ organizationId, slug }),
    queryKey: KEY_USE_GET_REFERENCE_GROUP_BY_SLUG(organizationId, slug),
    staleTime: 5 * 60 * 1000, // 5 minutes — slug→id mapping rarely changes
  });
};

export default useGetReferenceGroupBySlugQuery;
