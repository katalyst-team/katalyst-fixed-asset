import { useQuery } from "@tanstack/react-query";

import {
  GetSavedQueriesResponse,
  getSavedQueriesService,
} from "@/services/fixed-assets/getSavedQueriesService";

interface UseGetSavedQueriesQueryParams {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_SAVED_QUERIES = (organizationId: string) => [
  "faSavedQueries",
  organizationId,
];

const useGetSavedQueriesQuery = ({
  enabled = true,
  organizationId,
}: UseGetSavedQueriesQueryParams) => {
  return useQuery<GetSavedQueriesResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getSavedQueriesService({ organizationId }),
    queryKey: KEY_USE_GET_FA_SAVED_QUERIES(organizationId),
    staleTime: 60 * 1000,
  });
};

export default useGetSavedQueriesQuery;
