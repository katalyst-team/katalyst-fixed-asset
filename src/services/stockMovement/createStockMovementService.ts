import fetcher, { ApiResponse } from "@/services";

export interface CreateStockMovementRequest {
  image_urls?: string[];
  item_ids: string[];
  note: string;
  reference_number?: string;
  stock_movement_type_id: string;
}

export interface CreateStockMovementData {
  id: string;
}

export interface CreateStockMovementResponse {
  data: CreateStockMovementData;
}

interface CreateStockMovementServiceParams {
  organizationId: string;
  storeId: string;
  sectionId: string;
  data: CreateStockMovementRequest;
}

export const createStockMovementService = async ({
  organizationId,
  storeId,
  sectionId,
  data,
}: CreateStockMovementServiceParams): Promise<
  ApiResponse<CreateStockMovementResponse>
> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/sections/${sectionId}/stock-movements`,
  });
};