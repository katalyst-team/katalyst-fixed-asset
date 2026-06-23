import type { FaSavedQuery } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetSavedQueriesResponse = ApiResponse<{
  queries: FaSavedQuery[];
}>;

interface GetSavedQueriesParams {
  organizationId: string;
}

export const getSavedQueriesService = async ({
  organizationId,
}: GetSavedQueriesParams): Promise<GetSavedQueriesResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/rtls/saved-queries`,
  });
};
