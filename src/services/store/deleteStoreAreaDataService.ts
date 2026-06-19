import fetcher, { ApiResponse } from "..";

export interface DeleteStoreAreaDataResponse
  extends ApiResponse<{ id: string }> {
  id: string;
}

interface DeleteStoreAreaDataParams {
  organizationId: string;
  storeId: string;
  areaId: string;
}

export const deleteStoreAreaDataService = async ({
  organizationId,
  storeId,
  areaId,
}: DeleteStoreAreaDataParams): Promise<DeleteStoreAreaDataResponse> => {
  const url = `/v1/organizations/${organizationId}/stores/${storeId}/sections/${areaId}`;
  return fetcher({
    method: "DELETE",
    url,
  });
};
