import fetcher, { ApiResponse } from "..";

export interface UpsertSubcategoryAttributeItem {
  attribute_id: string;
  is_required: boolean;
}

export interface UpsertSubcategoryAttributesParams {
  attribute_items: UpsertSubcategoryAttributeItem[];
  category_id: string;
  organization_id: string;
}

export type UpsertSubcategoryAttributesResponse = ApiResponse<{
  attributes_count: number;
  category_id: string;
  subcategories_count: number;
  subcategory_ids: string[];
}>;

export const upsertSubcategoryAttributesService = async ({
  attribute_items,
  category_id,
  organization_id,
}: UpsertSubcategoryAttributesParams): Promise<UpsertSubcategoryAttributesResponse> => {
  return fetcher({
    data: { attribute_items },
    method: "PATCH",
    url: `/v1/organizations/${organization_id}/categories/${category_id}/subcategories/attributes`,
  });
};
