import type { ApiResponse } from "@/services";

// RFID/EPC Types
export enum RfidType {
  REUSABLE = "REUSABLE",
  DISPOSABLE = "DISPOSABLE",
}

export enum RfidCategory {
  SINGLE = "SINGLE",
  PACKAGE = "PACKAGE",
}

export enum RfidStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface RfidItemType {
  id: string;
  epc: string;
  internal_code: string | null;
  name: string;
  type: RfidType;
  category: RfidCategory;
  status: RfidStatus;
  created_at: string;
  updated_at: string;
  cycle_count: number | null;
  is_used: boolean;
  store?: { id: string; name: string } | null;
}

export type RfidSortBy = "cycle_count" | "name";
export type RfidOrderBy = "asc" | "desc";

export interface RfidFilterOptions {
  type?: RfidType;
  category?: RfidCategory;
  status?: RfidStatus;
  epcs?: string[];
  cursor?: string;
  limit?: number;
  is_used?: boolean;
  assigned_store_id?: string;
  rfid_name?: string;
  sort_by?: RfidSortBy;
  order_by?: RfidOrderBy;
}

// Create RFID payload
export interface CreateRfidPayload {
  rfids: {
    epc: string;
    type: RfidType;
    category: RfidCategory;
    name?: string;
    status: RfidStatus;
    store_id?: string;
  }[];
}

// Update RFID payload
export interface UpdateRfidPayload {
  rfids: {
    id: string;
    epc: string;
    type: RfidType;
    name: string;
    category: RfidCategory;
    status: RfidStatus;
    store_id?: string;
  }[];
}

// Delete RFID payload
export interface DeleteRfidPayload {
  ids: string[];
}

// Response types
export interface RfidResponse {
  rfids: RfidItemType[];
}

// Stock Movement Types
export enum StockMovementDirection {
  INBOUND = "INBOUND",
  OUTBOUND = "OUTBOUND",
}

export interface StockMovementType {
  direction: StockMovementDirection;
  id: string;
  name: string;
}

export interface Editor {
  id: string;
  name: string;
}

export interface Section {
  id: string;
  name: string;
}

export interface Store {
  id: string;
  name: string;
}

export interface ItemStatus {
  id: string;
  name: string;
}

export interface PackingCollection {
  description: string;
  id: string;
  name: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface Color {
  id: string;
  name: string;
}

export interface Size {
  id: string;
  name: string;
}

export interface SkuAttribute {
  attribute_id: string;
  description: string;
  name: string;
  type: string;
  values: string[];
}

export interface Category {
  id: string;
  name: string;
  subcategory: Array<{
    id: string;
    name: string;
  }>;
}

export interface SkuDetail {
  attributes: SkuAttribute[];
  brand: Brand;
  categories: Category[];
  color: Color;
  id: string;
  image_urls: string[];
  internal_code: string;
  name: string;
  size: Size;
  sku: string;
  status: string;
  type: string;
}

export interface ItemDetail {
  aging: number;
  epc: string;
  expiry_date: string;
  id: string;
  packing_collection: PackingCollection;
  rfid_detail: RfidItemType;
  section: Section;
  sku: SkuDetail;
  status: ItemStatus;
  store: Store;
  updated_at: string;
}

export interface ItemStatusHistory {
  changed_at: string;
  item: ItemDetail;
}

export interface StockMovement {
  created_at: string;
  editor: Editor;
  id: string;
  image_urls: string[] | null;
  new_item_status_histories: ItemStatusHistory[] | null;
  note: string;
  quantity: number;
  section: Section;
  stock_movement_type: StockMovementType;
  store_id: string;
  store_name: string;
  updated_at: string;
}

export interface RfidDetailWithStockMovements {
  category: RfidCategory;
  created_at: string;
  epc: string;
  id: string;
  is_used: boolean;
  internal_code: string | null;
  name: string;
  status: RfidStatus;
  stock_movements: StockMovement[] | null;
  type: RfidType;
  updated_at: string;
  cycle_count: number | null;
  store: { id: string; name: string } | null;
}

export type RfidDetailResponse = ApiResponse<RfidDetailWithStockMovements>;

export type RfidListResponse = ApiResponse<{ rfids: RfidItemType[] | null }>;

export type RfidCreateResponse = ApiResponse<{
  rfids: RfidItemType[] | null;
}>;

export type RfidDeleteResponse = ApiResponse<{
  id: string;
}>;

export interface RfidHistoryStatusItem {
  quantity: number;
  sku_id: string;
  sku_name: string;
}

export interface RfidHistoryOperator {
  id: string;
  name: string;
}

export interface RfidHistoryStockMovement {
  direction: StockMovementDirection;
  id: string;
  type: string;
}

export interface RfidHistoryItem {
  created_at: string;
  event_type: string;
  id: string;
  items: RfidHistoryStatusItem[] | null;
  note: string;
  operator: RfidHistoryOperator | null;
  stock_movement: RfidHistoryStockMovement | null;
  store: Store | null;
  sub_store: Section | null;
}

export interface RfidHistoryResponse {
  histories: RfidHistoryItem[] | null;
}

// RFID Map types
export interface RfidMapItem {
  epc: string;
  expiry_date: string;
  id: string;
  packing_collection: {
    description: string;
    id: string;
    name: string;
  };
  rfid_detail: {
    category: RfidCategory;
    created_at: string;
    epc: string;
    id: string;
    name: string;
    status: RfidStatus;
    type: RfidType;
    updated_at: string;
  };
  section: {
    id: string;
    name: string;
  };
  sku: {
    attributes: Array<{
      attribute_id: string;
      description: string;
      name: string;
      type: "TEXT";
      values: string[];
    }>;
    brand: {
      id: string;
      name: string;
    };
    categories: Array<{
      id: string;
      name: string;
      subcategory: Array<{
        id: string;
        name: string;
      }>;
    }>;
    color: {
      id: string;
      name: string;
    };
    id: string;
    image_urls: string[];
    internal_code: string;
    name: string;
    size: {
      id: string;
      name: string;
    };
    sku: string;
    status: "ACTIVE";
  };
  status: {
    id: string;
    name: "WAITING_PRINT";
  };
  updated_at: string;
}

export interface RfidMapData {
  category: RfidCategory;
  created_at: string;
  epc: string;
  id: string;
  items: RfidMapItem[] | null;
  name: string;
  status: RfidStatus;
  type: RfidType;
  updated_at: string;
}

export interface RfidMapResponse {
  data: {
    items: Record<string, RfidMapData>;
  };
  metadata: {
    code: string;
    correlation_id: string;
    message: string;
    server_time: number;
    success: boolean;
  };
  page_pagination: {
    count: number;
    has_next: boolean;
    has_prev: boolean;
    limit: number;
    next_page: number;
    page: number;
    prev_page: number;
    total_pages: number;
    total_records: number;
  };
  pagination: {
    count: number;
    next_cursor: string;
    prev_cursor: string;
  };
}

export interface GetRfidsMapParams {
  organizationID: string;
  storeID: string;
}

export interface GetRfidsMapPayload {
  category?: RfidCategory;
  cursor?: string;
  epcs?: string[];
  limit?: number;
  section_id?: string;
  status_ids?: string[];
  type?: RfidType;
}
