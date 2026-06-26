import { useQuery } from "@tanstack/react-query";

import {
  GetAssetLifecycleResponse,
  getAssetLifecycleService,
} from "@/services/fixed-assets/getAssetLifecycleService";

interface UseGetAssetLifecycleQueryParams {
  cursor?: string;
  enabled?: boolean;
  limit?: number;
  organizationId: string;
  stage?: string;
}

export const KEY_USE_GET_FA_LIFECYCLE = (
  organizationId: string,
  stage?: string,
) => ["faLifecycle", organizationId, stage];

const useGetAssetLifecycleQuery = ({
  cursor,
  enabled = true,
  limit,
  organizationId,
  stage,
}: UseGetAssetLifecycleQueryParams) => {
  return useQuery<GetAssetLifecycleResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () =>
      getAssetLifecycleService({ cursor, limit, organizationId, stage }),
    queryKey: KEY_USE_GET_FA_LIFECYCLE(organizationId, stage),
    staleTime: 60 * 1000,
  });
};

export default useGetAssetLifecycleQuery;
