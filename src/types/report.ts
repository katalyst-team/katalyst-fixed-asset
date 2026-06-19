export interface ReportFilterOptions {
  category_id?: string;
  stock_movement_direction?: "INBOUND" | "OUTBOUND";
  start_date?: string;
  end_date?: string;
  cursor?: string;
  limit?: number;
}

export interface ReportItemEditor {
  first_name: string;
  id: string;
  last_name: string;
}

export interface ReportItemRfidDetail {
  category: "SINGLE" | "PACKAGE";
  created_at: string;
  epc: string;
  id: string;
  is_used: boolean;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  type: "REUSABLE" | "DISPOSABLE";
  updated_at: string;
}

export interface ReportItemSection {
  id: string;
  name: string;
}

export interface ReportItemAttribute {
  attribute_id: string;
  description: string;
  name: string;
  type: "TEXT" | "NUMBER" | "DATE" | "BOOLEAN";
  values: string[] | null;
}

export interface ReportItemSubcategory {
  id: string;
  name: string;
}

export interface ReportItemCategory {
  id: string;
  name: string;
  subcategory: ReportItemSubcategory[] | null;
}

export interface ReportItemSku {
  attributes: ReportItemAttribute[] | null;
  categories: ReportItemCategory[] | null;
  id: string;
  image_urls: string[] | null;
  internal_code: string;
  name: string;
  sku: string;
  status: "ACTIVE" | "INACTIVE";
  type: "COMMON" | "UNIQUE";
}

export interface ReportItemStatus {
  id: string;
  name: string;
}

export interface ReportItem {
  editor: ReportItemEditor;
  epc: string;
  expiry_date: string;
  id: string;
  rfid_detail: ReportItemRfidDetail;
  section: ReportItemSection;
  sku: ReportItemSku;
  status: ReportItemStatus;
  updated_at: string;
}

export interface ReportStore {
  address: string;
  id: string;
  name: string;
}

export interface ReportData {
  end_date: string;
  items: ReportItem[] | null;
  start_date: string;
  store: ReportStore;
}
