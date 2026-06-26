import { useQuery } from "@tanstack/react-query";

import {
  GetPredictiveModelsResponse,
  getPredictiveModelsService,
} from "@/services/fixed-assets/getPredictiveModelsService";

interface UseGetPredictiveModelsQueryParams {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_PREDICTIVE_MODELS = (organizationId: string) => [
  "faPredictiveModels",
  organizationId,
];

const useGetPredictiveModelsQuery = ({
  enabled = true,
  organizationId,
}: UseGetPredictiveModelsQueryParams) => {
  return useQuery<GetPredictiveModelsResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getPredictiveModelsService({ organizationId }),
    queryKey: KEY_USE_GET_FA_PREDICTIVE_MODELS(organizationId),
    staleTime: 60 * 1000,
  });
};

export default useGetPredictiveModelsQuery;
