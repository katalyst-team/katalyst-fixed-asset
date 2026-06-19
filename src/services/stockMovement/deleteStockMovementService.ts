import fetcher, { ApiResponse } from "@/services";

interface DeleteStockMovementServiceParams {
  organizationId: string;
  storeId: string;
  itemIds: string[];
  stockMovementId: string;
}

export interface DeleteStockMovementResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  metadata: {
    code: string;
    correlation_id: string;
    message: string;
    server_time: number;
    success: boolean;
  };
  pagination: {
    count: number;
    next_cursor: string;
    prev_cursor: string;
  };
}

export const deleteStockMovementService = async ({
  organizationId,
  storeId,
  itemIds,
  stockMovementId,
}: DeleteStockMovementServiceParams): Promise<
  ApiResponse<DeleteStockMovementResponse>
> => {
  return fetcher({
    data: {
      item_ids: itemIds,
      stock_movement_id: stockMovementId,
    },
    method: "DELETE",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/items-rfid`,
  });
};
