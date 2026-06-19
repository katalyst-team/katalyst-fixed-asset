import { GetRecentTransactionsParams, GetRecentTransactionsResponse } from "@/types/transaction";

import fetcher, { ApiResponse } from "..";

export type { GetRecentTransactionsParams, GetRecentTransactionsResponse };

export const getRecentTransactionsService = async ({
  organizationId,
  limit = 10,
  storeId,
}: GetRecentTransactionsParams): Promise<ApiResponse<GetRecentTransactionsResponse>> => {
  const queryParams = new URLSearchParams();
  if (limit) queryParams.append("limit", limit.toString());
  if (storeId) queryParams.append("store_id", storeId);

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/transactions/recent?${queryParams.toString()}`,
  });
};
