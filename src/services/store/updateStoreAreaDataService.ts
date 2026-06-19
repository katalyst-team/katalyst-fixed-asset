import { PatchStoreAreaDataParams } from "@/types/store";

import fetcher, { ApiResponse } from "..";

export interface UpdateStoreAreaDataResponse
  extends ApiResponse<{ id: string }> {
  id: string;
}

export const updateStoreAreaDataService = async ({
  areaId,
  areaName,
  storeId,
  organizationId,
}: PatchStoreAreaDataParams): Promise<UpdateStoreAreaDataResponse> => {
  const url = `/v1/organizations/${organizationId}/stores/${storeId}/sections/${areaId}`;
  return fetcher({
    data: {
      name: areaName,
    },
    method: "PATCH",
    url,
  });
};
