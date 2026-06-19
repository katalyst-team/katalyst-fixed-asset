import { ApiResponse } from "@/services";

export type CheckingObjectType = "SECTION";

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

export type AuditResult = "CONSISTENT" | "MISMATCH";
export type AuditStatus = "PENDING" | "COMPLETED";
export type AuditType = "ALL";
export type SortOption = "DISCREPANCY" | "LAST_AUDIT" | "ACCURACY";

export interface StockAuditAreaItem {
  id: string;
  name: string;
  expected_quantity: number;
  actual_quantity: number | null;
  accuracy: number | null;
  last_audit_date: string | null;
  total_audit_issue: number | null;
  last_audit_result: AuditResult | null;
  editor: Editor | null;
}

export interface StockAuditAreaSummary {
  average_accuracy: number;
  overdue: number;
  section_with_discrepancy: number;
  total: number;
}

export interface StockAuditAreaListResponse extends ApiResponse {
  data: {
    date: string;
    total: number;
    section_with_discrepancy: number;
    average_accuracy: number;
    overdue: number;
    audit_sections: StockAuditAreaItem[] | null;
  };
}

export interface StockAuditAreaCreateResponse extends ApiResponse {
  data: {
    id: string;
  };
}

export interface StockAuditAreaCreatePayload {
  section_id?: string;
  stock_movement_type_names?: string[];
  store_id: string;
}

export interface StockAuditAreaFilterOptions {
  date?: string;
  sort?: SortOption;
  stock_movement_type_names?: string[];
}

// Detail Stock Audit Area Types
export interface SectionMetrics {
  current_expected_quantity: number;
  last_audit_accuracy: number;
  last_audit_actual_quantity: number;
  last_audit_expected_quantity: number;
  last_audit_timestamp: string;
  section: {
    id: string;
    name: string;
  };
}

export interface SectionMetricsResponse extends ApiResponse {
  data: SectionMetrics;
}

export interface AuditHistoryItem {
  id: string;
  created_at: string;
  updated_at: string;
  editor: Editor;
  type: AuditType;
  status: AuditStatus;
  result: AuditResult;
  expected_quantity: number;
  actual_quantity: number;
  extra_quantity: number;
  missing_quantity: number;
  note: string;
  checking_object: CheckingObject;
}

export interface AuditHistoryResponse extends ApiResponse {
  data: {
    items: AuditHistoryItem[] | null;
  };
}

export interface AuditHistoryFilterOptions {
  auditor?: string;
  sort_order?: "ASC" | "DESC";
  stock_movement_type_names?: string[];
}
