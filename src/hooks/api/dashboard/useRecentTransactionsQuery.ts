import { useQuery } from "@tanstack/react-query";

import { ApiResponse } from "@/services";
import {
  GetRecentTransactionsParams,
  GetRecentTransactionsResponse,
  getRecentTransactionsService,
} from "@/services/dashboard/getRecentTransactionsService";

export const KEY_USE_GET_RECENT_TRANSACTIONS = (
  organizationId: string,
  storeId?: string,
) => ["recentTransactions", organizationId, storeId];

const useGetRecentTransactionsQuery = ({
  organizationId,
  limit = 10,
  storeId,
}: GetRecentTransactionsParams) => {
  return useQuery<ApiResponse<GetRecentTransactionsResponse>, Error>({
    enabled: Boolean(organizationId),
    queryFn: () => getRecentTransactionsService({ limit, organizationId, storeId }),
    queryKey: KEY_USE_GET_RECENT_TRANSACTIONS(organizationId, storeId),
    refetchInterval: 60000,
    staleTime: 60000,
  });
};

export default useGetRecentTransactionsQuery;
