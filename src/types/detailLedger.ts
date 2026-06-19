// Import existing types - no redundancy
import { SKUAtributeItemType } from "./attribute";
import { CategoryItemType } from "./category";
import { EmployeeItemType } from "./employee";
import {
  Brand,
  Color,
  RfidItemType,
  Section,
  Size,
  Store
} from "./rfid";
import { NullableIdName, SkuProductStockMovement } from "./sku";

// =====================
// UI/Helper Types
// =====================

export interface DetailLedgerProductItemType {
  no: string;
  productName: string;
  quantity: number;
  lastStatus: string;
  id?: string;
}

export interface DetailLedgerHistoryItemType {
  no: string;
  status: string;
  lastUpdate: string;
  operator: string;
}



// =====================
// API Response Types
// =====================

// Editor with first/last name - Pick from EmployeeItemType
export type EditorWithName = Pick<EmployeeItemType, "id" | "first_name" | "last_name">;

// SKU type for detail ledger response
export interface DetailLedgerSkuType {
  id: string;
  sku: string;
  name: string;
  internal_code: string | null;
  brand: Brand;
  color: Color;
  size: Size;
  categories: Omit<CategoryItemType, "attribute_items">[] | null;
  image_urls: string[] | null;
  status: string;
  type: string;
  attributes: SKUAtributeItemType[] | null;
}



// Item status history with stock movements
export interface ItemStatusHistoryType {
  id: string;
  changed_at: string;
  editor: EditorWithName;
  editor_aor_id: string;
  old_status: NullableIdName;
  new_status: NullableIdName;
  old_stock_movement: SkuProductStockMovement | null;
  new_stock_movement: SkuProductStockMovement | null;
  item?: {
    id: string;
    epc?: string;
    rfid_detail?: RfidItemType;
    section?: NullableIdName;
    sku?: DetailLedgerSkuType;
    status?: NullableIdName;
  };
}

// Main detail ledger item type
export interface DetailLedgerItemType {
  id: string;
  epc: string;
  created_at: string;
  updated_at: string;
  status: NullableIdName;
  sku: DetailLedgerSkuType;
  rfid_detail: RfidItemType | null;
  section: Section | null;
  store: Store | null;
  expiry_date: string | null;
  item_status_histories: ItemStatusHistoryType[] | null;
}
