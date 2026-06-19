import { ApiResponse } from "@/services";

import { VerificationLogEntry, VerificationStatus } from "./verification";

export type CheckingObjectType = "SECTION" | "SKU";

export interface CheckingObject {
  id: string;
  name: string;
  type: CheckingObjectType;
}

export interface Editor {
  first_name: string;
  id: string;
  last_name: string;
}

export interface Organization {
  id: string;
  name: string;
}

export interface Store {
  id: string;
  name: string;
}

export type AuditType = "ALL" | "BY_SKU" | "BY_SECTION" | "ODOO_STOCK_OPNAME";
export type AuditResult = "CONSISTENT" | "MISMATCH";
export type AuditStatus = "PENDING" | "COMPLETED" | "ON_PROGRESS";
export type DiscrepancyStatus =
  | "MATCH"
  | "MATCHED"
  | "MISSING"
  | "UNEXPECTED"
  | "NOT_RECORDED";

export interface StockAuditItem {
  actual_quantity: number;
  checking_object: CheckingObject | null;
  created_at: string;
  editor: Editor;
  expected_quantity: number;
  extra_quantity: number;
  missing_quantity: number;
  id: string;
  image_urls?: string[] | null;
  note: string;
  organization: Organization;
  result: AuditResult;
  status: AuditStatus;
  stock_movement_type_names?: string[] | null;
  store: Store;
  type: AuditType;
  updated_at: string;
  verification_status?: VerificationStatus | null;
}

export interface StockAuditListResponse extends ApiResponse {
  data: {
    items: StockAuditItem[] | null;
  };
}

export interface StockAuditCreateResponse extends ApiResponse {
  data: {
    id: string;
  };
}

export interface ItemStatus {
  id: string | null;
  name: string | null;
}

export interface Section {
  id: string | null;
  name: string | null;
}

export interface Brand {
  id: string | null;
  name: string | null;
}

export interface Subcategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  subcategory: Subcategory[] | null;
}

export interface Color {
  id: string | null;
  name: string | null;
}

export interface Size {
  id: string | null;
  name: string | null;
}

export interface Sku {
  brand: Brand;
  categories: Category[] | null;
  color: Color;
  id: string;
  image_urls: string[] | null;
  internal_code: string | null;
  name: string;
  size: Size;
  sku: string;
  status: string;
}

export interface DiscrepancyItem {
  discrepancy_id: string;
  discrepancy_status: DiscrepancyStatus;
  epc: string;
  item_id: string;
  item_status: ItemStatus;
  rfid_detail: {
    category: string;
    created_at: string;
    epc: string;
    id: string;
    is_used?: boolean;
    name: string;
    status: string;
    type: string;
    updated_at: string;
    cycle_count?: number | null;
    store?: Store | null;
  } | null;
  section: Section;
  sku: Sku;
  updated_at: string;
}

export interface DiscrepancyItemsGroup {
  matched_items?: DiscrepancyItem[] | null;
  missing_items?: DiscrepancyItem[] | null;
  not_recorded_items?: DiscrepancyItem[] | null;
  unexpected_items?: DiscrepancyItem[] | null;
}

export type DiscrepancyItemsResponse =
  | DiscrepancyItem[]
  | DiscrepancyItemsGroup
  | null;

export interface OdooScanItem {
  epc: string;
  item_id: string | null;
  rfid_name: string | null;
  registered: boolean;
  section_id: string | null;
  section_name: string | null;
  sku_code: string | null;
  sku_id: string | null;
  sku_name: string | null;
}

export interface StockAuditDetail extends StockAuditItem {
  discrepancy_items: DiscrepancyItemsResponse;
  epcs?: string[] | null;
  odoo_scan_items?: OdooScanItem[] | null;
  verification_logs?: VerificationLogEntry[] | null;
}

export interface StockAuditDetailResponse extends ApiResponse {
  data: StockAuditDetail;
}

export interface StockAuditCreatePayload {
  section_id?: string;
  sku_id?: string;
  stock_movement_type_names?: string[];
  store_id: string;
  type: AuditType;
}

export interface DiscrepancyItemUpdate {
  item_id: string;
  status: DiscrepancyStatus;
}

export interface StockAuditUpdatePayload {
  actual_quantity?: number;
  discrepancy_items?: DiscrepancyItemUpdate[];
  editor_aor_id?: string;
  expected_quantity?: number;
  note?: string;
  result?: AuditResult;
  status?: AuditStatus;
}

export interface StockAuditFilterOptions {
  aor_id?: string;
  checking_object_id?: string;
  cursor?: string;
  limit?: number;
  order_direction?: "ASC" | "DESC";
  result?: AuditResult;
  status?: AuditStatus;
  stock_movement_type_names?: string[];
  type?: AuditType;
}
