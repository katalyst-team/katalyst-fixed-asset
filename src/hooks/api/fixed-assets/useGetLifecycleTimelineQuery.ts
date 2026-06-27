import { useQuery } from "@tanstack/react-query";

import {
  GetLifecycleTimelineResponse,
  getLifecycleTimelineService,
} from "@/services/fixed-assets/getLifecycleTimelineService";

interface UseGetLifecycleTimelineQueryParams {
  assetId: string;
  enabled?: boolean;
  limit?: number;
  organizationId: string;
  page?: number;
}

export const KEY_USE_GET_FA_LIFECYCLE_TIMELINE = (
  organizationId: string,
  assetId: string,
) => ["faLifecycleTimeline", organizationId, assetId];

const useGetLifecycleTimelineQuery = ({
  assetId,
  enabled = true,
  limit,
  organizationId,
  page,
}: UseGetLifecycleTimelineQueryParams) => {
  return useQuery<GetLifecycleTimelineResponse, Error>({
    enabled: Boolean(organizationId && assetId && enabled),
    queryFn: () =>
      getLifecycleTimelineService({ assetId, limit, organizationId, page }),
    queryKey: KEY_USE_GET_FA_LIFECYCLE_TIMELINE(organizationId, assetId),
    staleTime: 60 * 1000,
  });
};

export default useGetLifecycleTimelineQuery;
