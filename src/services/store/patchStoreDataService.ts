import fetcher, { ApiResponse } from "..";

export interface PatchStoreDataParams {
  storeID: string;
  name: string;
  status: string;
  organizationID: string;
  address: string;
}

export type PatchStoreDataResponse = ApiResponse<{ id: string }>;

export const patchStoreDataService = async (
  params: PatchStoreDataParams
): Promise<PatchStoreDataResponse> => {
  const url = `/v1/organizations/${params.organizationID}/stores/${params.storeID}`;
  return fetcher({
    data: {
      address: params.address,
      name: params.name,
      status: params.status,
    },
    method: "PATCH",
    url,
  });
};
