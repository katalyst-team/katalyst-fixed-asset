import type { FaLifecycleAsset, FaLifecycleSummary } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetAssetLifecycleResponse = ApiResponse<{
  assets: FaLifecycleAsset[];
  summary: FaLifecycleSummary;
}>;

interface GetAssetLifecycleParams {
  cursor?: string;
  limit?: number;
  organizationId: string;
  stage?: string;
}

export const getAssetLifecycleService = async ({
  cursor,
  limit,
  organizationId,
  stage,
}: GetAssetLifecycleParams): Promise<GetAssetLifecycleResponse> => {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", String(limit));
  if (stage) params.set("stage", stage);
  const qs = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/lifecycle${qs}`,
  });
};
