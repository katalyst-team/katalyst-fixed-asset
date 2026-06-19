import fetcher, { ApiResponse } from "..";

export interface DeleteStockMovementTypeParams {
  organization_id: string;
  stock_movement_type_id: string;
}

export type DeleteStockMovementTypeResponse = ApiResponse<{ id: string }>;

export const deleteStockMovementTypeService = async (
  params: DeleteStockMovementTypeParams
): Promise<DeleteStockMovementTypeResponse> => {
  const url = `/v1/organizations/${params.organization_id}/stock-movement-types/${params.stock_movement_type_id}`;

  return fetcher({
    method: "DELETE",
    url,
  });
};

export default deleteStockMovementTypeService;
