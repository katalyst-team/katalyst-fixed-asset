import fetcher, { ApiResponse } from "..";

export interface BulkCreateSubcategoryItem {
  attribute_defaults?: { attribute_id: string; values: string[] }[];
  attribute_items?: { attribute_id: string; is_required: boolean }[];
  attributes?: string[];
  code?: string;
  name: string;
  store_ids?: string[];
}

export interface BulkCreateSubcategoriesParams {
  category_id: string;
  organization_id: string;
  subcategories: BulkCreateSubcategoryItem[];
}

export type BulkCreateSubcategoriesResponse = ApiResponse<{
  ids: string[];
}>;

export const bulkCreateSubcategoriesService = async ({
  category_id,
  organization_id,
  subcategories,
}: BulkCreateSubcategoriesParams): Promise<BulkCreateSubcategoriesResponse> => {
  return fetcher({
    data: { subcategories },
    method: "POST",
    url: `/v1/organizations/${organization_id}/categories/${category_id}/subcategories/bulk`,
  });
};
