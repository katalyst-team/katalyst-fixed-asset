import { ApiResponse } from "@/services";

export type StockAuditTotalSource = "ODOO_STOCK_OPNAME" | string;
export type StockAuditTotalStatus = "PENDING" | "ON_PROGRESS" | "COMPLETED" | "FAILED" | string;

export interface StockAuditTotalSession {
  accuracy_percent: number;
  completed_at: string | null;
  external_ref: string | null;
  external_ref_name?: string | null;
  id: string;
  source: StockAuditTotalSource;
  source_name?: string | null;
  started_at: string;
  status: StockAuditTotalStatus;
  store?: {
    id: string;
    name: string | null;
  } | null;
  store_id: string;
  store_name?: string | null;
  total_actual: number;
  total_expected: number;
  total_extra: number;
  total_matched: number;
  total_missing: number;
}

export interface StockAuditTotalListData {
  sessions: StockAuditTotalSession[];
}

export type StockAuditTotalListResponse = ApiResponse<StockAuditTotalListData>;

export interface StockAuditTotalSummary {
  accuracy_percent: number;
  total_actual: number;
  total_expected: number;
  total_extra: number;
  total_matched: number;
  total_missing: number;
}

export interface StockAuditTotalBreakdownSkuItem {
  actual_qty: number;
  expected_qty: number;
  extra_qty: number;
  matched_qty: number;
  missing_qty: number;
  sku_code: string;
  sku_id: string;
  sku_name: string;
}

export interface StockAuditTotalDiscrepancyItem {
  actual_qty: number;
  delta_qty: number;
  epc: string;
  expected_qty: number;
  rfid: string;
  section_id: string | null;
  section_name: string | null;
  sku_code: string;
  sku_id: string;
  sku_name: string;
  type: string;
  updated_at: string;
}

export interface StockAuditTotalItem {
  actual_qty: number;
  epc: string;
  expected_qty: number;
  extra_qty: number;
  matched_qty: number;
  missing_qty: number;
  rfid: string;
  rfid_name: string | null;
  section_id: string | null;
  section_name: string | null;
  session_id: number;
  sku_code: string;
  sku_id: string;
  sku_name: string;
}

export interface StockAuditTotalMeta {
  completed_at: string | null;
  external_ref: string | null;
  external_ref_name?: string | null;
  failure_reason?: string | null;
  session_id: string;
  source: StockAuditTotalSource;
  source_name?: string | null;
  started_at: string;
  store?: {
    id: string;
    name: string | null;
  } | null;
  store_id: string;
  store_name?: string | null;
}

export interface StockAuditTotalDetailData {
  breakdown_by_sku: StockAuditTotalBreakdownSkuItem[];
  discrepancy_items: StockAuditTotalDiscrepancyItem[];
  items: StockAuditTotalItem[];
  meta: StockAuditTotalMeta;
  summary: StockAuditTotalSummary;
}

export type StockAuditTotalDetailResponse = ApiResponse<StockAuditTotalDetailData>;

export interface SyncStockAuditTotalPayload {
  external_ref?: string;
  items: Array<{
    lot_id?: number;
    product_id: number;
    qty: number;
    rfid: string;
  }>;
  results: Array<{
    message?: string;
    product_id: number;
    rfid: string;
    status: string;
  }>;
  source: StockAuditTotalSource;
  store_id: string;
}

export interface SyncStockAuditTotalResult {
  accepted: boolean;
  external_ref: string;
  queued_at: string;
}

export type SyncStockAuditTotalResponse = ApiResponse<SyncStockAuditTotalResult>;

export interface StockAuditTotalListFilters {
  date_from?: string;
  date_to?: string;
  source?: string;
  status?: string;
  store_id?: string;
}
