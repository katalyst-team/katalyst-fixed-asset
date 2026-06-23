import fetcher, { ApiResponse } from "..";

export type DeleteSavedQueryResponse = ApiResponse<{ deleted: boolean }>;

interface DeleteSavedQueryParams {
  organizationId: string;
  queryId: string;
}

export const deleteSavedQueryService = async ({
  organizationId,
  queryId,
}: DeleteSavedQueryParams): Promise<DeleteSavedQueryResponse> => {
  return fetcher({
    method: "DELETE",
    url: `/v1/organizations/${organizationId}/fa/rtls/saved-queries/${queryId}`,
  });
};
