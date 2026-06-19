import fetcher, { ApiResponse } from "@/services";
import { SkuType } from "@/types/sku";

export interface UpdateSkuDataParams {
  organization_id: string;
  sku_id: string;
  name?: string;
  description?: string;
  brand_id?: string;
  color_id?: string;
  size_id?: string;
  category_ids?: string[];
  image_urls?: string[];
  internal_code?: string;
  sku_type?: SkuType;
  store_id?: string;
  attribute_items: {
    attribute_id: string;
    values: string | number | string[];
  }[];
}

export type UpdateSkuDataResponse = ApiResponse<{ id: string }>;

export const updateSkuService = async (
  params: UpdateSkuDataParams
): Promise<UpdateSkuDataResponse> => {
  const url = `/v1/organizations/${params.organization_id}/skus/${params.sku_id}`;
  return fetcher({
    data: params,
    method: "PATCH",
    url,
  });
};

export default updateSkuService;
