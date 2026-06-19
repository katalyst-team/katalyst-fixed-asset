import { ApiResponse } from "@/services";

export interface Organization {
  id: string;
  name: string;
}

export interface Store {
  id: string;
  name: string;
}

export interface Section {
  id: string;
  name: string;
}

export interface Gate {
  id: string;
  name: string;
}

export type RFIDCategory = "SINGLE" | "PACKAGE";
export type RFIDType = "REUSABLE" | "DISPOSABLE";
export type RFIDStatus = "ACTIVE" | "INACTIVE";
export type ItemStatusName = "WAITING_PRINT" | "PRINTED" | "IN_STOCK" | "OUT_STOCK";
export type SKUStatus = "ACTIVE" | "INACTIVE";
export type SKUType = "COMMON" | "SPECIAL";

export interface RFIDDetail {
  category: RFIDCategory;
  created_at: string;
  epc: string;
  internal_code?: string;
  id: string;
  is_used: boolean;
  name: string;
  status: RFIDStatus;
  type: RFIDType;
  updated_at: string;
}

export interface PackingCollection {
  description: string;
  id: string;
  name: string;
}

export interface ItemStatus {
  id: string;
  name: ItemStatusName;
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

export interface Subcategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  subcategory: Subcategory[] | null;
}

export interface Attribute {
  attribute_id: string;
  description: string;
  name: string;
  type: "TEXT" | "NUMBER" | "DATE" | "BOOLEAN";
  values: string[] | null;
}

export interface SKU {
  attributes: Attribute[] | null;
  brand: Brand;
  categories: Category[] | null;
  color: Color;
  id: string;
  image_urls: string[] | null;
  internal_code: string;
  name: string;
  size: Size;
  sku: string;
  status: SKUStatus;
  type: SKUType;
}

export interface GateLogItem {
  aging: number;
  epc: string;
  expiry_date: string;
  id: string;
  packing_collection: PackingCollection;
  rfid_detail: RFIDDetail;
  section: Section;
  sku: SKU;
  status: ItemStatus;
  store: Store;
  updated_at: string;
}

export interface GateLog {
  ant: number;
  device_id: string | null;
  gate: Gate;
  gpio_trigger: boolean;
  id: string;
  items: GateLogItem[] | null;
  organization: Organization;
  rfid: RFIDDetail;
  rfid_status: RFIDStatus;
  rssi: number;
  section: Section;
  store: Store;
  ts: string;
}

export interface GateLogListResponse extends ApiResponse {
  data: {
    gate_log: GateLog[] | null;
  };
}

export interface GateLogDetailResponse extends ApiResponse {
  data: GateLog;
}

export interface GateLogFilterOptions {
  storeID?: string;
  sectionID?: string;
  limit?: number;
  cursor?: string;
}
