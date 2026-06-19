import fetcher, { ApiResponse } from "@/services";

export interface DeleteSkuDataParams {
  organization_id: string;
  sku_id: string;
}

export type DeleteSkuDataResponse = ApiResponse<{ id: string }>;

export const deleteSkuService = async (
  params: DeleteSkuDataParams
): Promise<DeleteSkuDataResponse> => {
  const url = `/v1/organizations/${params.organization_id}/skus/${params.sku_id}`;
  return fetcher({
    method: "DELETE",
    url,
  });
};

export default deleteSkuService;
