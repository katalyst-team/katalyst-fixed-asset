import fetcher, { ApiResponse } from "..";

export interface StockMovementTypeItem {
  direction: string;
  id: string;
  name: string;
}

export interface StockMovementTypesResponse {
  stock_movement_types: StockMovementTypeItem[];
}

export const getStockMovementTypesService = (
  organizationId: string
): Promise<ApiResponse<StockMovementTypesResponse>> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/stock-movement-types`,
  });
};
