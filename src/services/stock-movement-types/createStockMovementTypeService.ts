import fetcher, { ApiResponse } from "..";
import { StockMovementDirection } from "./getStockMovementTypesService";

export interface CreateStockMovementTypeParams {
  direction: StockMovementDirection;
  name: string;
  organization_id: string;
}

export type CreateStockMovementTypeResponse = ApiResponse<{ id: string }>;

export const createStockMovementTypeService = async (
  params: CreateStockMovementTypeParams
): Promise<CreateStockMovementTypeResponse> => {
  const url = `/v1/organizations/${params.organization_id}/stock-movement-types`;

  return fetcher({
    data: {
      direction: params.direction,
      name: params.name,
    },
    method: "POST",
    url,
  });
};
