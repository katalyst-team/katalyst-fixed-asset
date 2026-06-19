import { CategoryItemType } from "@/types/category";

import fetcher, { ApiResponse } from "..";

export type GetCategoryByIdResponse = ApiResponse<CategoryItemType>;

interface GetCategoryByIdParams {
  categoryId: string;
  organizationId: string;
}

export const getCategoryByIdService = async ({
  categoryId,
  organizationId,
}: GetCategoryByIdParams): Promise<GetCategoryByIdResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/categories/${categoryId}`,
  });
};
