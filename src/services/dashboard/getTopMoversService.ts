import { TopMoversData, TopMoversParams } from "@/types/top-movers";

import fetcher, { ApiResponse } from "..";

export type { TopMoversData, TopMoversParams };

export const getTopMoversService = async ({
  organization_id,
  store_id,
  period = "week",
  limit = 5,
  category_id,
  sort_by = "quantity",
  sort_order = "desc",
}: TopMoversParams): Promise<ApiResponse<{ data: TopMoversData }>> => {
  const queryParams = new URLSearchParams();
  if (store_id) queryParams.append("store_id", store_id);
  queryParams.append("period", period);
  queryParams.append("limit", limit.toString());
  if (category_id) queryParams.append("category_id", category_id);
  if (sort_by) queryParams.append("sort_by", sort_by);
  if (sort_order) queryParams.append("sort_order", sort_order);

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organization_id}/analytics/top-movers?${queryParams.toString()}`,
  });
};
