import type { FaLifecycleSummary } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetLifecycleSummaryResponse = ApiResponse<FaLifecycleSummary>;

interface GetLifecycleSummaryParams {
  organizationId: string;
}

export const getLifecycleSummaryService = async ({
  organizationId,
}: GetLifecycleSummaryParams): Promise<GetLifecycleSummaryResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/lifecycle/summary`,
  });
};
