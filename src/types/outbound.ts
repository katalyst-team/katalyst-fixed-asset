import { RfidCategory, RfidType } from "./rfid";

export interface OutboundItemType {
  no: string;
  productName: string;
  outboundCode: string;
  status: string;
  outboundType: string;
  outboundDate: string;
  outboundQty: number;
  warehouse: string;
  operator: string;
}

export interface OutboundFilterOptions {
  outboundCode?: string;
  productName?: string;
  status?: string;
  outboundDate?: Date;
  operator?: string;
  // param query for api
  order_direction?: "ASC" | "DESC";
  status_ids?: string[];
  last_updated_start?: string;
  last_updated_end?: string;
  section_id?: string;
  stock_movement_type_ids?: string[];
  category_ids?: string[];
  internal_code?: string;
  parent_category_ids?: string[];
  rfid_category?: RfidCategory;
  rfid_name?: string;
  rfid_type?: RfidType;
  editor_aor_id?: string;
  selected_store_for_section?: string;
  // pagination
  cursor?: string;
  limit?: number;
}

export interface Category {
  label: string;
  value: string;
}
