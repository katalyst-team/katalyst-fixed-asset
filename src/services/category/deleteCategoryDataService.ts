import fetcher, { ApiResponse } from "..";

export interface DeleteCategoryDataParams {
  organization_id: string;
  category_id: string;
}

export type DeleteCategoryDataResponse = ApiResponse<{ id: string }>;

export const deleteCategoryDataService = async (
  params: DeleteCategoryDataParams
): Promise<DeleteCategoryDataResponse> => {
  const url = `/v1/organizations/${params.organization_id}/categories/${params.category_id}`;
  return fetcher({
    method: "DELETE",
    url,
  });
};
