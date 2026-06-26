import type { FaPredictionResult } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetPredictionResultsResponse = ApiResponse<{
  predictions: FaPredictionResult[];
}>;

interface GetPredictionResultsParams {
  organizationId: string;
  severity?: string;
}

export const getPredictionResultsService = async ({
  organizationId,
  severity,
}: GetPredictionResultsParams): Promise<GetPredictionResultsResponse> => {
  const qs = severity ? `?severity=${severity}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/predictive/results${qs}`,
  });
};
