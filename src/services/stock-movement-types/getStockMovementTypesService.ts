import fetcher, { ApiResponse } from "..";

export type StockMovementDirection = "INBOUND" | "OUTBOUND" | "LEDGER";

export interface StockMovementType {
  direction: StockMovementDirection;
  id: string;
  name: string;
}

export interface StockMovementTypesFilters {
  direction?: StockMovementDirection;
  cursor?: string;
  limit?: number;
}

export type GetStockMovementTypesResponse = ApiResponse<{
  stock_movement_types: StockMovementType[];
}>;

export const getStockMovementTypesService = async (
  organizationId: string,
  filters?: StockMovementTypesFilters
): Promise<GetStockMovementTypesResponse> => {
  const params = new URLSearchParams();

  if (filters?.direction) params.append("direction", filters.direction);
  if (filters?.cursor) params.append("cursor", filters.cursor);
  if (filters?.limit) params.append("limit", filters.limit.toString());

  const url = `/v1/organizations/${organizationId}/stock-movement-types`;
  const fullUrl = params.toString() ? `${url}?${params.toString()}` : url;

  return fetcher({
    method: "GET",
    url: fullUrl,
  });
};
