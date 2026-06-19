import type { ApiResponse } from "@/services";
import { RfidCategory, RfidStatus, RfidType } from "@/types/rfid";

// Action Types
export enum ActionType {
  ADD = "ADD",
  REMOVE = "REMOVE",
}

// Items Map Types
export interface ItemsMapSku {
  id: string;
  sku: string;
  name: string;
  internal_code: string;
  image_urls: string[];
  status: string;
  type: string;
  is_rfid_assigned: boolean;
  categories: Array<{
    id: string;
    name: string;
    subcategory: Array<{ id: string; name: string }>;
  }>;
  brand: { id: string; name: string };
  color: { id: string; name: string } | null;
  size: { id: string; name: string } | null;
  attributes: Array<{
    attribute_id: string;
    description: string;
    name: string;
    type: string;
    values: string[];
  }>;
  store: { id: string; name: string };
}

export interface ItemsMapRfidDetail {
  id: string;
  epc: string;
  name: string | null;
  type: RfidType;
  category: RfidCategory;
  status: RfidStatus;
  created_at: string;
  updated_at: string;
  cycle_count: number;
  is_used: boolean;
  store: { id: string; name: string };
}

export interface ItemsMapItem {
  id: string;
  epc: string;
  expiry_date: string;
  aging: number;
  updated_at: string;
  rfid_detail: ItemsMapRfidDetail | null;
  sku: ItemsMapSku;
  status: { id: string; name: string };
  section: { id: string; name: string };
  store: { id: string; name: string };
  packing_collection: {
    id: string;
    name: string;
    description: string;
  };
  stock_movement_type: {
    id: string;
    name: string;
    direction: string;
  };
}

export interface ItemsMapResponse {
  data: { items: ItemsMapItem[] };
  metadata: {
    code: string;
    correlation_id: string;
    message: string;
    server_time: number;
    success: boolean;
  };
  pagination: {
    count: number;
    next_cursor?: string;
    prev_cursor?: string;
    total_count?: number;
  };
}

// Filter Options
export interface ItemsMapFilterOptions {
  is_rfid_assigned?: boolean;
  cursor?: string;
  epcs?: string[];
  category_ids?: string[];
  expiry_date?: string;
  last_updated_end?: string;
  last_updated_start?: string;
  limit?: number;
  section_id?: string;
  show_total_count?: boolean;
  sku?: string;
  sku_ids?: string[];
  sku_name?: string;
  status_ids?: string[];
}

// Service Parameters
export interface GetItemsMapParams {
  organizationId: string;
  storeId: string;
  filters?: ItemsMapFilterOptions;
}

// Create/Remove RFID Payload
export interface CreateItemsRfidPayloadItem {
  epc: string;
  item_ids: string[];
}

export interface CreateItemsRfidPayload {
  action: ActionType;
  items: CreateItemsRfidPayloadItem[];
}

export interface CreateItemsRfidParams {
  organizationId: string;
  storeId: string;
  data: CreateItemsRfidPayload;
}

export type CreateItemsRfidResponse = ApiResponse<{ id: string }>;

// RFID Selection (for Add action)
export interface SelectedItemMapping {
  epc: string;
  rfidId: string;
  rfidCategory: RfidCategory;
  rfidName: string | null;
  itemIds: string[];
}

// Store Selection with "All Store"
export interface StoreOption {
  label: string;
  value: string;
}
