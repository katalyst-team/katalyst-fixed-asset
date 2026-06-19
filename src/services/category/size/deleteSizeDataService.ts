import fetcher, { ApiResponse } from "../..";

export interface DeleteSizeDataParams {
  id: string;
  organization_id: string;
}

export type DeleteSizeDataResponse = ApiResponse<{ id: string }>;

export const deleteSizeDataService = async (
  params: DeleteSizeDataParams
): Promise<DeleteSizeDataResponse> => {
  const url = `/v1/organizations/${params.organization_id}/sizes/${params.id}`;
  return fetcher({
    method: "DELETE",
    url,
  });
};
