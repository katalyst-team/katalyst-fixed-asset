import { StoreAreaItemType } from "@/types/store";

import fetcher, { ApiResponse } from "..";

export interface GetStoreAreaDataResponse
  extends ApiResponse<{ sections: StoreAreaItemType[] }> {
  sections: StoreAreaItemType[];
}

interface GetStoreAreaDataParams {
  limit?: number;
  name?: string;
  organizationId: string;
  storeId: string;
}

export const getStoreAreaDataService = async ({
  limit,
  name,
  organizationId,
  storeId,
}: GetStoreAreaDataParams): Promise<GetStoreAreaDataResponse> => {
  const params = new URLSearchParams();

  if (limit) {
    params.append("limit", limit.toString());
  }
  if (name) {
    params.append("name", name);
  }

  const url = `/v1/organizations/${organizationId}/stores/${storeId}/sections`;
  return fetcher({
    method: "GET",
    params,
    url,
  });
};
