import fetcher from "@/services";
import { StockMovementType } from "@/services/stockMovement/getStockMovementDataService";

export interface StockMovementTypeResponse {
  data: {
    stock_movement_types: StockMovementType[];
  };
  total: number;
}

interface GetStockMovementTypesParams {
  organizationId: string;
}

export const getStockMovementTypesService = async ({
  organizationId,
}: GetStockMovementTypesParams): Promise<StockMovementTypeResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/stock-movement-types`,
  });
};
