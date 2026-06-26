import { useQuery } from "@tanstack/react-query";

import {
  GetAssetLifecycleResponse,
  getAssetLifecycleService,
} from "@/services/fixed-assets/getAssetLifecycleService";

interface UseGetAssetLifecycleQueryParams {
  enabled?: boolean;
  limit?: number;
  organizationId: string;
  page?: number;
  stage?: string;
}

export const KEY_USE_GET_FA_LIFECYCLE = (
  organizationId: string,
  stage?: string,
) => ["faLifecycle", organizationId, stage];

const useGetAssetLifecycleQuery = ({
  enabled = true,
  limit,
  organizationId,
  page,
  stage,
}: UseGetAssetLifecycleQueryParams) => {
  return useQuery<GetAssetLifecycleResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () =>
      getAssetLifecycleService({ limit, organizationId, page, stage }),
    queryKey: KEY_USE_GET_FA_LIFECYCLE(organizationId, stage),
    staleTime: 60 * 1000,
  });
};

export default useGetAssetLifecycleQuery;
