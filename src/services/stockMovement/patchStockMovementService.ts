import fetcher, { ApiResponse } from "@/services";

export interface PatchStockMovementRequest {
  image_urls?: string[];
  note?: string;
  reference_number?: string;
  section_id?: string;
  stock_movement_type_id?: string;
}

export interface PatchStockMovementData {
  id: string;
}

interface PatchStockMovementServiceParams {
  data: PatchStockMovementRequest;
  organizationId: string;
  stockMovementId: string;
  storeId: string;
}

export const patchStockMovementService = async ({
  data,
  organizationId,
  stockMovementId,
  storeId,
}: PatchStockMovementServiceParams): Promise<
  ApiResponse<PatchStockMovementData>
> => {
  return fetcher({
    data,
    method: "PATCH",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/stock-movements/${stockMovementId}`,
  });
};
