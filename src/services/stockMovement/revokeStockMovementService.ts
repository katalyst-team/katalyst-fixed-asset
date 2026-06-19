import fetcher, { ApiResponse } from "@/services";

interface RevokeStockMovementParams {
  note?: string;
  organizationId: string;
  stockMovementId: string;
  storeId: string;
}

export const revokeStockMovementService = async ({
  note,
  organizationId,
  stockMovementId,
  storeId,
}: RevokeStockMovementParams): Promise<ApiResponse<{ id: string }>> => {
  return fetcher({
    data: note ? { note } : undefined,
    method: "POST",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/stock-movements/${stockMovementId}/revoke`,
  });
};
