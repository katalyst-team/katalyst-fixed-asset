import { useQuery } from "@tanstack/react-query";

import {
  GetPredictionResultsResponse,
  getPredictionResultsService,
} from "@/services/fixed-assets/getPredictionResultsService";

interface UseGetPredictionResultsQueryParams {
  enabled?: boolean;
  organizationId: string;
  severity?: string;
}

export const KEY_USE_GET_FA_PREDICTION_RESULTS = (
  organizationId: string,
  severity?: string,
) => ["faPredictionResults", organizationId, severity];

const useGetPredictionResultsQuery = ({
  enabled = true,
  organizationId,
  severity,
}: UseGetPredictionResultsQueryParams) => {
  return useQuery<GetPredictionResultsResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () =>
      getPredictionResultsService({ organizationId, severity }),
    queryKey: KEY_USE_GET_FA_PREDICTION_RESULTS(organizationId, severity),
    staleTime: 30 * 1000,
  });
};

export default useGetPredictionResultsQuery;
