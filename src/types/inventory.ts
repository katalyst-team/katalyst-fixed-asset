import { SKUAtributeItemType } from "./attribute";
import { BrandItemType } from "./brand";
import { CategoryItemType } from "./category";
import { ColorItemType } from "./color";
import { RfidCategory } from "./rfid";
import { SizeItemType } from "./size";

export interface InventoryItem {
  id: string;
  no: string;
  sku?: string;
  name: string;
  categories: CategoryItemType[] | null;
  brand: BrandItemType;
  color: ColorItemType;
  size: SizeItemType;
  quantity: number;
  aging: number;
  store_id?: string;
  store_name?: string;
  category_id?: string;
  brand_id?: string;
  color_id?: string;
  size_id?: string;
  internal_code?: string;
  location?: string;
  rfid?: string | { id?: string; epc?: string; name?: string };
  rfid_name?: string;
  section?: {
    id?: string;
    name?: string;
  } | null;
  section_name?: string;
  creator?: {
    id?: string;
    first_name?: string;
    last_name?: string;
  } | null;
  bundle_qty?: number;
  bundle_quantity?: number;
  attributes?: SKUAtributeItemType[];
}

export interface InventoryFilterOptions {
  query?: string;
  query_attributes?: string; //Example FORMAT: {"87f655f2-bfee-4822-8578-7cdd339e5fe5": ["Red", "Blue"], "f13cc6bb-5c0e-4bc7-8f0e-4fa6e04e6cfa": [true]}
  store_id?: string;
  stock_movement_type_id?: string;
  category_ids?: string[];
  cursor?: string;
  limit?: number;
  rfid_category?: RfidCategory;
  start_date?: string; // ISO date string: YYYY-MM-DD
  end_date?: string; // ISO date string: YYYY-MM-DD
  section_ids?: string[];
}

export interface PaginationResponse {
  count: number;
  total: number;
  cursor: string;
  has_more: boolean;
}

export interface InventoryResponse {
  inventories: InventoryItem[] | null;
}
