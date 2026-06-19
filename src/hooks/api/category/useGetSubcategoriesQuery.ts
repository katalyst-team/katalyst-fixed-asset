import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  GetSubcategoriesResponse,
  getSubcategoriesService,
} from "@/services/category/getSubcategoriesService";

interface UseGetSubcategoriesQueryParams {
  categoryId: string;
  cursor?: string;
  limit?: number;
  organizationId: string;
  query?: string;
  storeId?: string;
}

export const KEY_USE_GET_SUBCATEGORIES = (
  organizationId: string,
  categoryId: string,
  query?: string,
  storeId?: string,
  cursor?: string,
  limit?: number
) => ["subcategories", organizationId, categoryId, query, storeId, cursor, limit];

const useGetSubcategoriesQuery = ({
  categoryId,
  cursor,
  limit,
  organizationId,
  query,
  storeId,
}: UseGetSubcategoriesQueryParams) => {
  return useQuery<GetSubcategoriesResponse, Error>({
    enabled: Boolean(organizationId) && Boolean(categoryId),
    placeholderData: keepPreviousData,
    queryFn: () =>
      getSubcategoriesService({
        category_id: categoryId,
        cursor,
        limit,
        organization_id: organizationId,
        query,
        store_id: storeId,
      }),
    queryKey: KEY_USE_GET_SUBCATEGORIES(organizationId, categoryId, query, storeId, cursor, limit),
    staleTime: 60 * 1000,
  });
};

export default useGetSubcategoriesQuery;
