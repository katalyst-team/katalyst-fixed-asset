import type { CreateSavedQueryRequest, FaSavedQuery } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type CreateSavedQueryResponse = ApiResponse<{
  query: FaSavedQuery;
}>;

interface CreateSavedQueryParams {
  data: CreateSavedQueryRequest;
  organizationId: string;
}

export const createSavedQueryService = async ({
  data,
  organizationId,
}: CreateSavedQueryParams): Promise<CreateSavedQueryResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/rtls/saved-queries`,
  });
};
