import { useQuery } from "@tanstack/react-query";

import { ApiResponse } from "@/services";
import {
  GetCategoryDistributionParams,
  GetCategoryDistributionResponse,
  getCategoryDistributionService,
} from "@/services/dashboard/getCategoryDistributionService";

export const KEY_USE_GET_CATEGORY_DISTRIBUTION = (
  organizationId: string,
  storeId?: string,
) => ["categoryDistribution", organizationId, storeId];

const useGetCategoryDistributionQuery = ({
  organizationId,
  storeId,
}: GetCategoryDistributionParams) => {
  return useQuery<ApiResponse<GetCategoryDistributionResponse>, Error>({
    enabled: Boolean(organizationId),
    queryFn: () => getCategoryDistributionService({ organizationId, storeId }),
    queryKey: KEY_USE_GET_CATEGORY_DISTRIBUTION(organizationId, storeId),
    refetchInterval: 300000,
    staleTime: 300000,
  });
};

export default useGetCategoryDistributionQuery;
