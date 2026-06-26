import type { FaPredictiveModel, FaPredictiveSummary } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetPredictiveModelsResponse = ApiResponse<{
  models: FaPredictiveModel[];
  summary: FaPredictiveSummary;
}>;

interface GetPredictiveModelsParams {
  organizationId: string;
}

export const getPredictiveModelsService = async ({
  organizationId,
}: GetPredictiveModelsParams): Promise<GetPredictiveModelsResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/predictive/models`,
  });
};
