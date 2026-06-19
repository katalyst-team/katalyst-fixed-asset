import fetcher, { ApiResponse } from "@/services";

export interface DeleteBrandDataParams {
  organization_id: string;
  brand_id: string;
}

export type DeleteBrandDataResponse = ApiResponse<{ id: string }>;

export const deleteBrandDataService = async (
  params: DeleteBrandDataParams
): Promise<DeleteBrandDataResponse> => {
  const url = `/v1/organizations/${params.organization_id}/brands/${params.brand_id}`;
  return fetcher({
    method: "DELETE",
    url,
  });
};
