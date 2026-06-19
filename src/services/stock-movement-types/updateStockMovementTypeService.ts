import fetcher, { ApiResponse } from "..";
import { StockMovementDirection } from "./getStockMovementTypesService";

export interface UpdateStockMovementTypeParams {
  direction: StockMovementDirection;
  name: string;
  organization_id: string;
  stock_movement_type_id: string;
}

export type UpdateStockMovementTypeResponse = ApiResponse<{ id: string }>;

export const updateStockMovementTypeService = async (
  params: UpdateStockMovementTypeParams
): Promise<UpdateStockMovementTypeResponse> => {
  const url = `/v1/organizations/${params.organization_id}/stock-movement-types/${params.stock_movement_type_id}`;

  return fetcher({
    data: {
      direction: params.direction,
      name: params.name,
    },
    method: "PATCH",
    url,
  });
};
