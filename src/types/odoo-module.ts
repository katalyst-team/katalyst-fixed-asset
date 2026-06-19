export interface OdooProxyMetadata {
  code: string;
  correlation_id: string;
  message: string;
  server_time: number;
  success: boolean;
}

export interface OdooProxyExecuteResponse {
  data?: Record<string, unknown> | null;
  metadata: OdooProxyMetadata;
}

export type OdooHttpMethod = "GET" | "POST";

export type OdooProxyAction =
  | "list_rfids"
  | "register_rfid"
  | "list_transfers"
  | "assign_packs"
  | "deactivate_packs"
  | "review_unpack"
  | "list_products"
  | "get_product_detail"
  | "stock_audit"
  | "stock_opname"
  | "list_locations"
  | "get_location_detail";

export interface OdooProxyExecutePayload {
  action: OdooProxyAction;
  body?: Record<string, unknown>;
  params?: Record<string, string | number | boolean | undefined>;
  resourceId?: string;
}
