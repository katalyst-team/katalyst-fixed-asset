import fetcher, { ApiResponse } from "@/services";
import { DetailStockMovementResponse } from "@/types/detailStockMovement";

interface GetStockMovementDetailParams {
  organizationId: string;
  storeId: string;
  stockMovementId: string;
}

export const getStockMovementDetailService = async ({
  organizationId,
  storeId,
  stockMovementId,
}: GetStockMovementDetailParams): Promise<ApiResponse<DetailStockMovementResponse>> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/stock-movements/${stockMovementId}`,
  });
};
