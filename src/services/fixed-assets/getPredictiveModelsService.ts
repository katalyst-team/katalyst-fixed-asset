import type { FaPredictiveModel, FaPredictiveSummary } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetPredictiveModelsResponse = ApiResponse<{
  models: FaPredictiveModel[];
  summary: FaPredictiveSummary;
}>;

interface GetPredictiveModelsParams {
  assetType?: string;
  isActive?: boolean;
  limit?: number;
  organizationId: string;
  page?: number;
  q?: string;
}

export const getPredictiveModelsService = async ({
  assetType,
  isActive,
  limit,
  organizationId,
  page,
  q,
}: GetPredictiveModelsParams): Promise<GetPredictiveModelsResponse> => {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (typeof isActive === "boolean") params.set("is_active", String(isActive));
  if (assetType) params.set("asset_type", assetType);
  if (q) params.set("q", q);
  const qs = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/predictive/models${qs}`,
  });
};
