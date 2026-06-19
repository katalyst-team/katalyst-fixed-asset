import fetcher, { ApiResponse } from "../..";

export interface PostSizeDataParams {
  name: string;
  organization_id: string;
}

export type PostSizeDataResponse = ApiResponse<{ id: string }>;

export const postSizeDataService = async (
  params: PostSizeDataParams
): Promise<PostSizeDataResponse> => {
  const url = `/v1/organizations/${params.organization_id}/sizes`;
  return fetcher({
    data: params,
    method: "POST",
    url,
  });
};
