import fetcher from "../index";

export interface InventorySkuAttribute {
  attribute_id: string;
  // uppercase variants (legacy)
  Description: string;
  Name: string;
  Type: "TEXT" | "NUMBER" | "SELECT" | "BOOLEAN" | "DATE" | "DATETIME" | "CHECKBOX" | "REFERENCE_GROUP";
  Values: string[];
  // lowercase variants (current API responses)
  description?: string;
  name?: string;
  resolved_values?: { id: string; name: string }[] | null;
  type?: "TEXT" | "NUMBER" | "SELECT" | "BOOLEAN" | "DATE" | "DATETIME" | "CHECKBOX" | "REFERENCE_GROUP";
  values?: string[];
}

export interface InventorySkuBrand {
  id: string;
  name: string;
}

export interface InventorySkuCategory {
  code?: string;
  id: string;
  name: string;
  subcategory: Array<{
    id: string;
    name: string;
  }>;
}

export interface InventorySkuColor {
  id: string;
  name: string;
}

export interface InventorySkuSize {
  id: string;
  name: string;
}

export interface InventorySkuData {
  attributes: InventorySkuAttribute[];
  brand: InventorySkuBrand;
  categories: InventorySkuCategory[];
  color: InventorySkuColor;
  id: string;
  internal_code: string;
  name: string;
  quantity: number;
  aging: number;
  size: InventorySkuSize;
  sku: string;
  image_urls: string[];
  status: string;
}

export interface InventorySkuStore {
  aging?: number;
  id: string;
  name: string;
  quantity: number;
}

export interface InventorySkuResponse {
  data: {
    inventory: InventorySkuData;
    stores: InventorySkuStore[];
  };
  metadata: {
    code: string;
    correlation_id: string;
    message: string;
    server_time: number;
    success: boolean;
  };
}

export interface GetInventorySkuParams {
  organizationId: string;
  skuId: string;
}

export const getInventorySkuService = async (
  params: GetInventorySkuParams
): Promise<InventorySkuResponse> => {
  const { organizationId, skuId } = params;

  const response = await fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/inventories/skus/${skuId}`,
  });

  return response;
};
