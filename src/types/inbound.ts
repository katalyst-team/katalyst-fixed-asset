import { RfidCategory, RfidType } from "./rfid";

export interface InboundItemType {
  no: string;
  status: string;
  inboundType: string;
  inboundDate: string;
  inboundQty: number;
  warehouse: string;
  operator: string;
  id?: string;
  stock_movement_type_id?: string;
  store_id?: string;
  section_id?: string;
}

export interface InboundFilterOptions {
  inboundCode?: string;
  productName?: string;
  status?: string;
  inboundDate?: Date;
  operator?: string;
  // param query for api
  order_direction?: "ASC" | "DESC";
  status_ids?: string[];
  last_updated_start?: string;
  last_updated_end?: string;
  section_id?: string;
  stock_movement_type_ids?: string[];
  category_ids?: string[];
  parent_category_ids?: string[];
  internal_code?: string;
  rfid_category?: RfidCategory;
  rfid_name?: string;
  rfid_type?: RfidType;
  editor_aor_id?: string;
  selected_store_for_section?: string;
  verification_status?: string;
  // pagination
  cursor?: string;
  limit?: number;
}

export interface Category {
  label: string;
  value: string;
}

export interface StockMovementType {
  id: string;
  name: string;
  direction: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}
