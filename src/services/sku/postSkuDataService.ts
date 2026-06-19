import { CreateSkuParams } from "@/types/sku";

import fetcher, { ApiResponse } from "..";

export type PostSkuDataResponse = ApiResponse<{ id: string }>;

export const postSkuDataService = async (
  params: CreateSkuParams
): Promise<PostSkuDataResponse> => {
  const url = `/v1/organizations/${params.organization_id}/skus`;
  return fetcher({
    data: params,
    method: "POST",
    url,
  });
};
