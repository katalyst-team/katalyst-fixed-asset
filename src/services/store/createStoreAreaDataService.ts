import { PostStoreAreaDataParams } from "@/types/store";

import fetcher, { ApiResponse } from "..";

export interface CreateStoreAreaDataResponse
  extends ApiResponse<{ id: string }> {
  id: string;
}

export const createStoreAreaDataService = async ({
  areaName,
  storeId,
  organizationId,
}: PostStoreAreaDataParams): Promise<CreateStoreAreaDataResponse> => {
  const url = `/v1/organizations/${organizationId}/stores/${storeId}/sections`;
  return fetcher({
    data: {
      name: areaName,
    },
    method: "POST",
    url,
  });
};
