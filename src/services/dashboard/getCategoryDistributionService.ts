import { GetCategoryDistributionParams, GetCategoryDistributionResponse } from "@/types/category-distribution";

import fetcher, { ApiResponse } from "..";

export type { GetCategoryDistributionParams, GetCategoryDistributionResponse };

export const getCategoryDistributionService = async ({
  organizationId,
  storeId,
}: GetCategoryDistributionParams): Promise<ApiResponse<GetCategoryDistributionResponse>> => {
  const queryParams = new URLSearchParams();
  if (storeId) queryParams.append("store_id", storeId);

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/analytics/category-distribution?${queryParams.toString()}`,
  });
};
