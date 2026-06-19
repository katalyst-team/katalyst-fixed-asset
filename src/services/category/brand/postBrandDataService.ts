import fetcher, { ApiResponse } from "@/services";

export interface PostBrandDataParams {
  name: string;
  organization_id: string;
}

export type PostBrandDataResponse = ApiResponse<{ id: string }>;

export const postBrandDataService = async (
  params: PostBrandDataParams
): Promise<PostBrandDataResponse> => {
  const url = `/v1/organizations/${params.organization_id}/brands`;
  return fetcher({
    data: params,
    method: "POST",
    url,
  });
};
