import { CategoryItemType } from "@/types/category";

import fetcher, { ApiResponse } from "..";

export interface GetSubcategoriesParams {
  category_id: string;
  cursor?: string;
  limit?: number;
  organization_id: string;
  query?: string;
  show_total_count?: boolean;
  store_id?: string;
}

export type GetSubcategoriesResponse = ApiResponse<{
  subcategories: CategoryItemType[];
}>;

export const getSubcategoriesService = async (
  params: GetSubcategoriesParams
): Promise<GetSubcategoriesResponse> => {
  const searchParams = new URLSearchParams();
  if (params.store_id) searchParams.append("store_id", params.store_id);
  if (params.query) searchParams.append("query", params.query);
  if (params.cursor) searchParams.append("cursor", params.cursor);
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.show_total_count) searchParams.append("show_total_count", "true");
  const qs = searchParams.toString();
  const url = `/v1/organizations/${params.organization_id}/categories/${params.category_id}/subcategories${qs ? `?${qs}` : ""}`;
  return fetcher({ method: "GET", url });
};
