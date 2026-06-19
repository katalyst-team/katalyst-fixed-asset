export enum VerificationStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  VERIFIED = "VERIFIED",
  VALIDATED = "VALIDATED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export enum VerificationEntityType {
  AUDIT_STOCK_OPNAME = "AUDIT_STOCK_OPNAME",
  STOCK_MOVEMENT_INBOUND = "STOCK_MOVEMENT_INBOUND",
}

export type VerificationLogAction =
  | "AUTO_VERIFIED"
  | "CANCELLED"
  | "REJECTED"
  | "RESUBMITTED"
  | "REVOKED"
  | "SUBMITTED"
  | "VALIDATED"
  | "VERIFIED";

export interface VerificationLogActor {
  email: string;
  id: string;
  name: string;
}

export interface VerificationLogEntry {
  action: VerificationLogAction;
  actor: VerificationLogActor | null;
  created_at: string;
  from_status: string | null;
  id: string;
  note: string | null;
  to_status: string;
}

export interface VerificationSkuAttribute {
  attribute_id: string;
  description: string;
  name: string;
  type: string;
  values: string[];
}

export interface VerificationRfidDetail {
  id: string;
  name: string;
  epc: string;
  category: string;
  type: string;
  status: string;
  is_used: boolean;
  created_at: string;
  updated_at: string;
  cycle_count: number | null;
  store: string | null;
}

export interface VerificationSku {
  id: string;
  sku: string;
  name: string;
  internal_code: string | null;
  image_urls: string[];
  status: string;
  type: string;
  brand: { id: string | null; name: string | null };
  color: { id: string | null; name: string | null };
  size: { id: string | null; name: string | null };
  categories: { id: string; name: string; subcategory: unknown[] }[];
  attributes: VerificationSkuAttribute[] | null;
  store: unknown | null;
  is_connected_to_items: boolean;
  is_rfid_assigned: boolean;
}

export interface VerificationItem {
  id: string;
  epc: string | null;
  rfid_detail: VerificationRfidDetail | null;
  packing_collection: { id: string; name: string; description: string } | null;
  sku: VerificationSku | null;
  status: { id: string; name: string };
  section: { id: string | null; name: string | null };
  store: { id: string | null; name: string | null };
  expiry_date: string | null;
  updated_at: string;
  aging: string | null;
}

export interface VerificationItemHistory {
  item: VerificationItem;
  changed_at: string;
}

export interface VerificationEpc {
  id: string;
  name: string;
  epc: string;
}

export interface VerificationStockMovementDetail {
  id: string;
  editor: { id: string; name: string };
  store_id: string;
  store_name: string;
  stock_movement_type: { id: string; name: string; direction: string };
  verification_status: string;
  quantity: number;
  section: { id: string; name: string } | null;
  note: string;
  image_urls: string[];
  reference_number: string | null;
  created_at: string;
  updated_at: string;
  new_item_status_histories: VerificationItemHistory[] | null;
  rfid_tag_histories: unknown | null;
  epcs: VerificationEpc[] | null;
}

export interface VerificationPendingItem {
  entity_id: string;
  entity_type: VerificationEntityType;
  store_id: string;
  store_name: string;
  verification_status: VerificationStatus;
  title: string;
  note: string | null;
  created_at: string;
  updated_at: string;
  stock_movement_detail?: VerificationStockMovementDetail;
}

export interface VerificationPendingResponse {
  items: VerificationPendingItem[];
}

export interface VerificationActionParams {
  organizationId: string;
  storeId: string;
  entityType: VerificationEntityType;
  entityId: string;
  note?: string;
}

export interface VerificationFilterOptions {
  entityType?: VerificationEntityType;
}
