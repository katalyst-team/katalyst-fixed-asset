import type { FaLifecycleEvent } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetLifecycleTimelineResponse = ApiResponse<{
  events: FaLifecycleEvent[];
}>;

interface GetLifecycleTimelineParams {
  assetId: string;
  limit?: number;
  organizationId: string;
  page?: number;
}

export const getLifecycleTimelineService = async ({
  assetId,
  limit,
  organizationId,
  page,
}: GetLifecycleTimelineParams): Promise<GetLifecycleTimelineResponse> => {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  const qs = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/lifecycle/${assetId}/timeline${qs}`,
  });
};
