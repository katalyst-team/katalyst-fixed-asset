import type { FaLifecycleAsset, FaLifecycleSummary } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetAssetLifecycleResponse = ApiResponse<{
  assets: FaLifecycleAsset[];
  summary: FaLifecycleSummary;
}>;

interface GetAssetLifecycleParams {
  limit?: number;
  organizationId: string;
  page?: number;
  stage?: string;
}

export const getAssetLifecycleService = async ({
  limit,
  organizationId,
  page,
  stage,
}: GetAssetLifecycleParams): Promise<GetAssetLifecycleResponse> => {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (stage) params.set("stage", stage);
  const qs = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/lifecycle${qs}`,
  });
};
