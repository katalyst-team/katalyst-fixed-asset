import fetcher, { ApiResponse } from "@/services";

export interface PatchBrandDataParams {
  name: string;
  organization_id: string;
  brand_id: string;
}

export type PatchBrandDataResponse = ApiResponse<{ id: string }>;

export const patchBrandDataService = async (
  params: PatchBrandDataParams
): Promise<PatchBrandDataResponse> => {
  const url = `/v1/organizations/${params.organization_id}/brands/${params.brand_id}`;
  return fetcher({
    data: params,
    method: "PATCH",
    url,
  });
};
