import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { ApiResponse } from "@/services";
import { getCategoryDataService } from "@/services/category/getCategoryDataService";
import { CategoryFilterOptions, CategoryItemType } from "@/types/category";

interface UseGetCategoryDataQueryParams {
  cursor?: string;
  filters?: CategoryFilterOptions;
  limit?: number;
  organizationId: string;
  query?: string;
}

const useGetCategoryDataQuery = ({
  cursor,
  filters,
  limit,
  organizationId,
  query,
}: UseGetCategoryDataQueryParams) => {
  return useQuery<ApiResponse<{ categories: CategoryItemType[] | null }>, Error>({
    enabled: Boolean(organizationId),
    placeholderData: keepPreviousData,
    queryFn: () =>
      getCategoryDataService({
        cursor,
        limit,
        organization_id: organizationId,
        query,
        store_id: filters?.store_id,
      }),
    queryKey: ["categoryData", organizationId, filters?.store_id, query, cursor, limit],
    staleTime: 60 * 1000,
  });
};

export default useGetCategoryDataQuery;
