import fetcher, { ApiResponse } from "@/services";

interface CancelStockMovementParams {
  note?: string;
  organizationId: string;
  stockMovementId: string;
  storeId: string;
}

export const cancelStockMovementService = async ({
  note,
  organizationId,
  stockMovementId,
  storeId,
}: CancelStockMovementParams): Promise<ApiResponse<{ id: string }>> => {
  return fetcher({
    data: note ? { note } : undefined,
    method: "POST",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/stock-movements/${stockMovementId}/cancel`,
  });
};
