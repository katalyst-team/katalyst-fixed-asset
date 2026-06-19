import { CategoryItemType } from "@/types/category";

import fetcher, { ApiResponse } from "..";

export interface GetCategoryDataParams {
  cursor?: string;
  limit?: number;
  organization_id: string;
  query?: string;
  store_id?: string;
}

export type GetCategoryDataResponse = ApiResponse<{
  categories: CategoryItemType[];
}>;

export const getCategoryDataService = async (
  params: GetCategoryDataParams
): Promise<GetCategoryDataResponse> => {
  const searchParams = new URLSearchParams();
  if (params.store_id) searchParams.append("store_id", params.store_id);
  if (params.query) searchParams.append("query", params.query);
  if (params.cursor) searchParams.append("cursor", params.cursor);
  if (params.limit) searchParams.append("limit", params.limit.toString());
  const qs = searchParams.toString();
  const url = `/v1/organizations/${params.organization_id}/categories${qs ? `?${qs}` : ""}`;
  return fetcher({
    method: "GET",
    url,
  });
};
