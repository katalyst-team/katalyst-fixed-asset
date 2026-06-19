import fetcher, { type ApiResponse } from "@/services";

export interface PatchItemStatusServiceParams {
  organizationId: string;
  storeId: string;
  itemId: string;
  data: {
    status_id?: string;
  };
}

export const patchItemStatusService = async ({
  organizationId,
  storeId,
  itemId,
  data,
}: PatchItemStatusServiceParams): Promise<ApiResponse<{ id: string }>> => {
  return fetcher({
    data,
    method: "PATCH",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/items/${itemId}`,
  });
};
