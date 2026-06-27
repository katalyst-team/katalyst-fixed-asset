import { useQuery } from "@tanstack/react-query";

import {
  GetLifecycleSummaryResponse,
  getLifecycleSummaryService,
} from "@/services/fixed-assets/getLifecycleSummaryService";

interface UseGetLifecycleSummaryQueryParams {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_LIFECYCLE_SUMMARY = (organizationId: string) => [
  "faLifecycleSummary",
  organizationId,
];

const useGetLifecycleSummaryQuery = ({
  enabled = true,
  organizationId,
}: UseGetLifecycleSummaryQueryParams) => {
  return useQuery<GetLifecycleSummaryResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getLifecycleSummaryService({ organizationId }),
    queryKey: KEY_USE_GET_FA_LIFECYCLE_SUMMARY(organizationId),
    staleTime: 60 * 1000,
  });
};

export default useGetLifecycleSummaryQuery;
