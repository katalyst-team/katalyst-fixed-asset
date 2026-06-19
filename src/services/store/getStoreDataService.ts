import { StoreItemType } from "@/types/store";

import fetcher, { ApiResponse } from "..";

export interface GetStoreDataResponse
  extends ApiResponse<{ stores: StoreItemType[] }> {
  stores: StoreItemType[];
}

interface GetStoreDataParams {
  organizationId: string;
  filters?: GetStoreDataFiltersParams;
}

export interface GetStoreDataFiltersParams {
  query?: string;
  limit?: number;
  cursor?: string;
}

export const getStoreDataService = async ({
  organizationId,
  filters,
}: GetStoreDataParams): Promise<GetStoreDataResponse> => {
  const params = new URLSearchParams();

  if (filters?.cursor) {
    params.append("cursor", filters.cursor);
  }

  if (filters?.limit) {
    params.append("limit", filters.limit.toString());
  }

  if (filters?.query) {
    params.append("query", filters.query);
  }

  const url = `/v1/organizations/${organizationId}/stores`;
  return fetcher({
    method: "GET",
    params: params,
    url,
  });
};
