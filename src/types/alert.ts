export interface CriticalStockAlertItemType {
  sku_id: string;
  sku_name: string;
  current_stock: number;
  safety_stock: number;
  store_id: string;
}

export interface GetCriticalStockAlertsParams {
  organizationId: string;
}

export interface GetCriticalStockAlertsResponse {
  count: number;
  items: CriticalStockAlertItemType[];
}

export interface AgingStockAlertItemType {
  sku_id: string;
  sku_name: string;
  last_movement_date: string;
  days_aging: number;
  current_stock: number;
}

export interface GetAgingStockAlertsParams {
  organizationId: string;
}

export interface GetAgingStockAlertsResponse {
  count: number;
  items: AgingStockAlertItemType[];
}

export interface EpcMismatchAlertItemType {
  epc: string;
  expected_location: string;
  actual_location?: string;
  last_scan_time: string;
}

export interface GetEpcMismatchesParams {
  organizationId: string;
}

export interface GetEpcMismatchesResponse {
  count: number;
  date: string;
  mismatches: EpcMismatchAlertItemType[];
}

export interface PendingAuditAlertItemType {
  audit_id: string;
  audit_name: string;
  store_id: string;
  scheduled_date: string;
  status: "scheduled" | "in_progress";
}

export interface GetPendingAuditsParams {
  organizationId: string;
}

export interface GetPendingAuditsResponse {
  count: number;
  audits: PendingAuditAlertItemType[];
}
