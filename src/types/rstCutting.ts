import type { ApiResponse } from "@/services";

export interface RegisterItemAttributeItem {
  attribute_id: string;
  values: string;
}

export interface RegisterItemItem {
  quantity: number;
  expiry_date?: string;
}

export interface RegisterItemsRequest {
  internal_code: string;
  name?: string;
  sku?: string;
  epcs?: string[];
  items: RegisterItemItem[];
  category_ids?: string[];
  attribute_items?: RegisterItemAttributeItem[];
  sku_id?: string;
  section_id?: string;
  stock_movement_type_id?: string;
  status?: string;
  sku_type?: string;
  image_urls?: string[];
}

export interface RegisterItemsResponse {
  sku_id: string;
  item_ids: string[];
  is_new_sku: boolean;
}

export interface RegisterItemsServiceParams {
  organizationId: string;
  storeId: string;
  data: RegisterItemsRequest;
}

export type RegisterItemsApiResponse = ApiResponse<RegisterItemsResponse>;

export interface PatchItemStatusParams {
  organizationId: string;
  storeId: string;
  itemId: string;
  status_id: string;
}

export type PatchItemStatusResponse = ApiResponse<{ id: string }>;
