import { useQuery } from "@tanstack/react-query";

import { ApiResponse } from "@/services";
import {
  getTopMoversService,
  TopMoversData,
  TopMoversParams,
} from "@/services/dashboard/getTopMoversService";

export const KEY_USE_GET_TOP_MOVERS = (
  organizationId: string,
  storeId?: string,
  period?: string,
  limit?: number,
  categoryId?: string,
  sortBy?: string,
  sortOrder?: string,
) => [
  "topMovers",
  organizationId,
  storeId,
  period,
  limit,
  categoryId,
  sortBy,
  sortOrder,
];

const useGetTopMoversQuery = ({
  organization_id,
  store_id,
  period = "week",
  limit = 5,
  category_id,
  sort_by = "quantity",
  sort_order = "desc",
}: TopMoversParams) => {
  return useQuery<ApiResponse<{ data: TopMoversData }>, Error>({
    enabled: Boolean(organization_id),
    queryFn: () =>
      getTopMoversService({
        category_id,
        limit,
        organization_id,
        period,
        sort_by,
        sort_order,
        store_id,
      }),
    queryKey: KEY_USE_GET_TOP_MOVERS(
      organization_id,
      store_id,
      period,
      limit,
      category_id,
      sort_by,
      sort_order,
    ),
    refetchInterval: 300000,
    staleTime: 300000,
  });
};

export default useGetTopMoversQuery;
