import fetcher, { ApiResponse } from "..";

export interface PatchCategoryDataParams {
  attribute_defaults?: { attribute_id: string; values: string[] }[];
  attribute_items?: { attribute_id: string; is_required: boolean }[];
  attributes?: string[];
  category_id: string;
  code?: string;
  default_subcategory_id?: string | null;
  name: string;
  organization_id: string;
  parent_id?: string;
  store_ids?: string[];
}

export type PatchCategoryDataResponse = ApiResponse<{ id: string }>;

export const patchCategoryDataService = async (
  params: PatchCategoryDataParams
): Promise<PatchCategoryDataResponse> => {
  const url = `/v1/organizations/${params.organization_id}/categories/${params.category_id}`;
  return fetcher({
    data: params,
    method: "PATCH",
    url,
  });
};
