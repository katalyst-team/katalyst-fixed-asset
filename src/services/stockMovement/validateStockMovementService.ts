import fetcher, { ApiResponse } from "@/services";

interface ValidateStockMovementParams {
  note?: string;
  organizationId: string;
  stockMovementId: string;
  storeId: string;
}

export const validateStockMovementService = async ({
  note,
  organizationId,
  stockMovementId,
  storeId,
}: ValidateStockMovementParams): Promise<ApiResponse<{ id: string }>> => {
  return fetcher({
    data: note ? { note } : undefined,
    method: "POST",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/stock-movements/${stockMovementId}/validate`,
  });
};
