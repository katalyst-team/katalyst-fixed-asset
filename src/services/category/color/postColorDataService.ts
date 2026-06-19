import fetcher, { ApiResponse } from "../..";

export interface PostColorDataParams {
  name: string;
  organization_id: string;
}

export type PostColorDataResponse = ApiResponse<{ id: string }>;

export const postColorDataService = async (
  params: PostColorDataParams
): Promise<PostColorDataResponse> => {
  const url = `/v1/organizations/${params.organization_id}/colors`;
  return fetcher({
    data: params,
    method: "POST",
    url,
  });
};
