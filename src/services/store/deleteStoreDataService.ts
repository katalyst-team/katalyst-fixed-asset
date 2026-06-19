import fetcher, { ApiResponse } from "..";

export interface DeleteStoreDataParams {
  organizationID: string;
  storeID: string;
}

export type DeleteStoreDataResponse = ApiResponse<{ id: string }>;

export const deleteStoreDataService = async (
  params: DeleteStoreDataParams
): Promise<DeleteStoreDataResponse> => {
  const url = `/v1/organizations/${params.organizationID}/stores/${params.storeID}`;
  return fetcher({
    method: "DELETE",
    url,
  });
};
