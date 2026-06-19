import { SKUAtributeItemType } from "./attribute";
import {
  Editor,
  RfidItemType,
  Section,
  StockMovementType,
  Store,
} from "./rfid";

// Reusable nullable ID/Name type
export interface NullableIdName {
  id: string | null;
  name: string | null;
}

// Stock movement in item status history
export interface SkuProductStockMovement {
  id: string;
  editor: Editor;
  store_id: string | null;
  store_name: string;
  stock_movement_type: StockMovementType;
  quantity: number;
  section: Section;
  note: string | null;
  image_urls: string[] | null;
  created_at: string;
  updated_at: string;
  new_item_status_histories: null;
}

// Item status history for ledger product
export interface SkuProductItemStatusHistory {
  id: string;
  editor_aor_id: string;
  editor: Editor;
  old_status: NullableIdName;
  new_status: NullableIdName;
  old_stock_movement: SkuProductStockMovement;
  new_stock_movement: SkuProductStockMovement;
  changed_at: string;
}

// Nested SKU in item (minimal version)
export interface SkuProductNestedSku {
  id: string;
  sku: string;
  name: string;
  internal_code: string | null;
  image_urls: string[] | null;
  status: string;
  type: string;
  brand: NullableIdName;
  color: NullableIdName;
  size: NullableIdName;
  categories: {
    code?: string;
    id: string;
    name: string;
    subcategory: { id: string; name: string }[] | null;
  }[] | null;
  attributes: SKUAtributeItemType[] | null;
}

// Full item type for ledger product SKU
export interface SkuProductItem {
  id: string;
  epc: string | null;
  rfid_detail: RfidItemType | null;
  sku: SkuProductNestedSku;
  status: NullableIdName;
  section: NullableIdName;
  store: Store;
  expiry_date: string | null;
  inbound_date: string | null;
  outbound_date: string | null;
  area_transfer_date: string | null;
  aging_days: number | null;
  created_at: string;
  updated_at: string;
  last_item_status_history: SkuProductItemStatusHistory | null;
}

export interface SkuItemType {
  id: string;
  name: string;
  description?: string;
  organization_id?: string;
  brand_id?: string;
  color_id?: string;
  size_id?: string;
  internal_code: string;
  sku: string;
  image_urls: string[] | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  categories: {
    code?: string;
    id: string;
    name: string;
    subcategory: {
      id: string;
      name: string;
    }[] | null;
  }[] | null;
  brand?: {
    id: string;
    name: string;
  };
  color?: {
    id: string;
    name: string;
  };
  size?: {
    id: string;
    name: string;
  };
  rfid?: {
    epc: string;
    name: string | null;
  } | null;
  attributes: SKUAtributeItemType[] | null;
  status: SkuStatus;
  type: SkuType;
  store?: NullableIdName | null;
  item?: SkuProductItem;
}

export interface SkuFilterOptions {
  name?: string;
  brand_id?: string;
  color_id?: string;
  size_id?: string;
  type?: SkuType;
  query?: string;
  internal_code?: string;
  status?: SkuStatus;
  category_ids?: string[];
  parent_category_ids?: string[];
  query_attributes?: string; // JSON string of Record<string, string[]>
  sku_ids?: string[];
  assigned_store_id?: string;
}

export enum SkuStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum SkuType {
  COMMON = "COMMON",
  UNIQUE = "UNIQUE",
}

export interface CreateSkuParams {
  brand_id?: string;
  category_ids?: string[];
  color_id?: string;
  image_urls?: string[];
  name: string;
  organization_id: string;
  size_id?: string;
  sku: string;
  status: SkuStatus;
  sku_type?: SkuType;
  internal_code?: string;
  store_id?: string;
  attribute_items: {
    attribute_id: string;
    values: string | number | string[];
  }[];
}

export interface FilePresignedResponse {
  upload_url: string;
  bucket: string;
  expires_at: number;
  filename: string;
}
