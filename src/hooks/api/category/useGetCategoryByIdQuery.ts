import { useQuery } from "@tanstack/react-query";

import {
  GetCategoryByIdResponse,
  getCategoryByIdService,
} from "@/services/category/getCategoryByIdService";

interface UseGetCategoryByIdQueryParams {
  categoryId: string;
  organizationId: string;
}

export const KEY_USE_GET_CATEGORY_BY_ID = (
  organizationId: string,
  categoryId: string
) => ["category", organizationId, categoryId];

const useGetCategoryByIdQuery = ({
  categoryId,
  organizationId,
}: UseGetCategoryByIdQueryParams) => {
  return useQuery<GetCategoryByIdResponse, Error>({
    enabled: Boolean(organizationId) && Boolean(categoryId),
    queryFn: () => getCategoryByIdService({ categoryId, organizationId }),
    queryKey: KEY_USE_GET_CATEGORY_BY_ID(organizationId, categoryId),
    staleTime: 60 * 1000,
  });
};

export default useGetCategoryByIdQuery;
