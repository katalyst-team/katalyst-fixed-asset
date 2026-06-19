import fetcher, { ApiResponse } from "@/services";
import { BrandItemType } from "@/types/brand";

export type GetBrandDataServiceResponse = ApiResponse<{
  brands: BrandItemType[];
}>;

export const getBrandDataService = async (
  organizationId: string
): Promise<GetBrandDataServiceResponse> => {
  const url = `/v1/organizations/${organizationId}/brands`;
  return fetcher({
    method: "GET",
    url,
  });
};
