import { ApiResponse } from "@/services";

export type InventoryAreaSortOption = "NAME" | "QUANTITY_ASC" | "QUANTITY_DESC";

export interface SectionInventorySummary {
  id: string;
  name: string;
  quantity: number;
}

export interface SkuAttribute {
  attribute_id: string;
  Description: string;
  Name: string;
  Type: string;
  Values: string[];
  description?: string;
  name?: string;
  resolved_values?: { id: string; name: string }[] | null;
  type?: string;
  values?: string[];
}

export interface SkuBrand {
  id: string;
  name: string;
}

export interface SkuCategory {
  id: string;
  name: string;
}

export interface SkuColor {
  id: string;
  name: string;
}

export interface SkuSize {
  id: string;
  name: string;
}

export interface InventoryItem {
  aging: number;
  attributes: SkuAttribute[];
  bundle_qty?: number;
  bundle_quantity?: number;
  brand: SkuBrand;
  categories: SkuCategory[];
  color: SkuColor;
  id: string;
  internal_code: string;
  location?: string;
  name: string;
  quantity: number;
  rfid?: string;
  rfid_name?: string;
  rfid_number?: string;
  section_name?: string;
  size: SkuSize;
  sku: string;
  store_id: string;
  store_name: string;
}

export interface InventoryAreaFilterOptions {
  section_ids?: string[];
  query?: string;
  rfid_name?: string;
  sort?: InventoryAreaSortOption;
  stock_movement_type_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface InventoryAreaDetailFilterOptions {
  query?: string;
  cursor?: string;
  limit?: number;
  stock_movement_type_ids?: string[];
  start_date?: string;
  end_date?: string;
}

export interface InventoryAreaListResponse extends ApiResponse {
  data: {
    sections: SectionInventorySummary[] | null;
    total_quantity: number;
    total_sections: number;
  };
}

export interface InventoryAreaDetailResponse extends ApiResponse {
  data: {
    inventories: InventoryItem[] | null;
    section: SectionInventorySummary;
    total_quantity: number;
  };
  pagination: {
    count: number;
    next_cursor: string;
    prev_cursor: string;
  };
}
