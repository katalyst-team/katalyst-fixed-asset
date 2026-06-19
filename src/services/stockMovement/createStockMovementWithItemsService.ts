import fetcher, { ApiResponse } from "@/services";

export interface CreateStockMovementWithItemsAttributeItem {
  attribute_id: string;
  values: string | number | string[];
}

export interface CreateStockMovementWithItemsItem {
  attribute_items?: CreateStockMovementWithItemsAttributeItem[];
  category_ids?: string[];
  epc: string;
  internal_code?: string;
  metadata?: Record<string, unknown>;
  name?: string;
}

export interface CreateStockMovementWithItemsRequest {
  image_urls?: string[];
  items: CreateStockMovementWithItemsItem[];
  metadata?: Record<string, unknown>;
  note?: string;
  reference_number?: string;
  stock_movement_type_id: string;
}

export interface CreateStockMovementWithItemsData {
  id: string;
  item_ids: string[];
  reference_number: string;
}

export interface CreateStockMovementWithItemsResponse {
  data: CreateStockMovementWithItemsData;
}

interface CreateStockMovementWithItemsServiceParams {
  organizationId: string;
  storeId: string;
  data: CreateStockMovementWithItemsRequest;
}

export const createStockMovementWithItemsService = async ({
  organizationId,
  storeId,
  data,
}: CreateStockMovementWithItemsServiceParams): Promise<
  ApiResponse<CreateStockMovementWithItemsResponse>
> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/stock-movements/create-with-items`,
  });
};
