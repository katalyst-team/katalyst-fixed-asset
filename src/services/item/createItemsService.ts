import fetcher, { ApiResponse } from "@/services";

export interface CreateItemInput {
  quantity: number;
  sku_id: string;
}

export interface CreateItemsRequest {
  items: CreateItemInput[];
}

export interface CreateItemsResponse {
  ids: string[];
}

interface CreateItemsServiceParams {
  data: CreateItemsRequest;
  organizationId: string;
  storeId: string;
}

export const createItemsService = async ({
  data,
  organizationId,
  storeId,
}: CreateItemsServiceParams): Promise<ApiResponse<CreateItemsResponse>> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/items`,
  });
};
