import type {
  FaPredictionResult,
  FaPredictiveSummary,
} from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetPredictionResultsResponse = ApiResponse<{
  predictions: FaPredictionResult[];
  summary: FaPredictiveSummary;
}>;

interface GetPredictionResultsParams {
  assetId?: string;
  limit?: number;
  modelId?: string;
  organizationId: string;
  page?: number;
  severity?: string;
}

export const getPredictionResultsService = async ({
  assetId,
  limit,
  modelId,
  organizationId,
  page,
  severity,
}: GetPredictionResultsParams): Promise<GetPredictionResultsResponse> => {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (severity) params.set("severity", severity);
  if (assetId) params.set("asset_id", assetId);
  if (modelId) params.set("model_id", modelId);
  const qs = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/predictive/results${qs}`,
  });
};
