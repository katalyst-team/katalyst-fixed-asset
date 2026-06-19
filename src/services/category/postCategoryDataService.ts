import fetcher, { ApiResponse } from "..";

export interface PostCategoryDataParams {
  attribute_defaults?: { attribute_id: string; values: string[] }[];
  attribute_items?: { attribute_id: string; is_required: boolean }[];
  attributes?: string[];
  code?: string;
  default_subcategory_id?: string | null;
  name: string;
  organization_id: string;
  parent_id?: string;
  store_ids?: string[];
}

export type PostCategoryDataResponse = ApiResponse<{ id: string }>;

export const postCategoryDataService = async (
  params: PostCategoryDataParams
): Promise<PostCategoryDataResponse> => {
  const url = `/v1/organizations/${params.organization_id}/categories`;
  return fetcher({
    data: params,
    method: "POST",
    url,
  });
};
