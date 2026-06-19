import { InventorySectionItem } from "./detailInventory";
import { RfidCategory, RfidItemType, RfidType } from "./rfid";
import { SkuItemType } from "./sku";

export enum EnumLedgerStatus {
  WAITING_PRINT = "WAITING_PRINT",
  WAITING_INBOUND = "WAITING_INBOUND",
  FAILED_INBOUND = "FAILED_INBOUND",
  SUCCESS_INBOUND = "SUCCESS_INBOUND",
}
export interface LedgerItemType {
  aging?: number;
  epc: string;
  id: string;
  sku: SkuItemType;
  section: InventorySectionItem;
  rfid_detail: RfidItemType;
  status: StatusType;
  updated_at: string;
  created_at: string;
  packing_collection?: {
    id: string;
    name: string;
  };
}

export interface LedgerFilter {
  sku?: string;
  sku_name?: string;
  category_ids?: string[];
  last_updated_start?: string;
  last_updated_end?: string;
  status_id?: string;
  epcs?: string[];
  store_id?: string;
  section_id?: string;
  sku_ids?: string[];
  // Additional filter properties
  order_direction?: "ASC" | "DESC";
  rfid_category?: RfidCategory;
  rfid_type?: RfidType;
  editor_aor_id?: string;
  selected_store_for_section?: string;
  stock_movement_type_ids?: string[];
  // pagination
  cursor?: string;
  limit?: number;
}

export enum ItemType {
  SINGLE = "SINGLE",
  PACKING = "PACKING",
}

export interface CreateLedgerItemParams {
  items: {
    quantity: number;
    sku_id: string;
    status_id: EnumLedgerStatus;
  }[];
  type: ItemType;
  packing_collection_id?: string;
}

export interface UpdateLedgerItemParams {
  sku_id: string;
  new_store_id?: string;
  epc: string | null;
  status_id: EnumLedgerStatus;
}

export interface LedgerResponse {
  items: LedgerItemType[] | null;
}

export interface LedgerDetailResponse {
  data: {
    item: LedgerItemType;
  };
}

export interface LedgerIdResponse {
  data: {
    ids: string[];
  };
}

export interface StatusType {
  id: string;
  name: string;
}

export enum EnumEpcHardcode {
  E28068940000502FBEC4B43F = "E28068940000502FBEC4B43F",
  E28068942000502FBEC4AC3F = "E28068942000502FBEC4AC3F",
  E28068942000402FBEC4A83F = "E28068942000402FBEC4A83F",

  E2806894000040320D475E22 = "E2806894000040320D475E22",
  E2806894000040320D477622 = "E2806894000040320D477622",
  E2806894000040320D476222 = "E2806894000040320D476222",
  E2806894000050320D475A22 = "E2806894000050320D475A22",
  E6162313233343537 = "6162313233343537",
  E2806894000050320D477222 = "E2806894000050320D477222",
  E2806894000050320D475622 = "E2806894000050320D475622",
  E2806894000040320D475222 = "E2806894000040320D475222",
  E2806894000050320D476A22 = "E2806894000050320D476A22",
  E2806894000050320D476622 = "E2806894000050320D476622",
  E2806894000040320D476E22 = "E2806894000040320D476E22",
  E2806894000050320D474E22 = "E2806894000050320D474E22",
  // novita
  E28068940000402FBEC87924 = "E28068940000402FBEC87924",
  E28068940000402FBEC80D24 = "E28068940000402FBEC80D24",
  E28068940000502FBEC87D24 = "E28068940000502FBEC87D24",

  // novita package
  E28068940000502FBEC80524 = "E28068940000502FBEC80524",
  E28068940000502FBEC86924 = "E28068940000502FBEC86924",

  // E2806894000050320D475A22 = "E2806894000040320D475A22",
  TEST1 = "test1",
  TEST2 = "test2",
  TEST3 = "test3",
  TEST4 = "test4",
  TEST5 = "test5",
  TEST6 = "test6",
  TEST7 = "test7",
  TEST8 = "test8",
}
