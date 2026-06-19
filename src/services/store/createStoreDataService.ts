import fetcher, { ApiResponse } from "..";

export interface PostStoreDataParams {
  name: string;
  status: string;
  organization_id: string;
  address: string;
}

export type PostStoreDataResponse = ApiResponse<{ id: string }>;

export const postStoreDataService = async (
  params: PostStoreDataParams
): Promise<PostStoreDataResponse> => {
  const url = `/v1/organizations/${params.organization_id}/stores`;
  return fetcher({
    data: params,
    method: "POST",
    url,
  });
};
