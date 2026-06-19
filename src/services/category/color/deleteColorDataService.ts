import fetcher, { ApiResponse } from "../..";

export interface DeleteColorDataParams {
  organization_id: string;
  color_id: string;
}

export type DeleteColorDataResponse = ApiResponse<{ id: string }>;

export const deleteColorDataService = async (
  params: DeleteColorDataParams
): Promise<DeleteColorDataResponse> => {
  const url = `/v1/organizations/${params.organization_id}/colors/${params.color_id}`;
  return fetcher({
    method: "DELETE",
    url,
  });
};
