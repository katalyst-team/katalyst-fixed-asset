import fetcher, { ApiResponse } from "@/services";
import { InboundFilterOptions } from "@/types/inbound";
import { RfidItemType } from "@/types/rfid";

export interface StockMovementItem {
  id: string;
  created_at: string;
  editor: Editor;
  new_item_status_histories: NewItemStatusHistory[];
  note: string;
  quantity: number;
  reference_number: string | null;
  section: Section;
  stock_movement_type: StockMovementType;
  store_id: string;
  store_name: string;
  image_urls: string[];
  updated_at: string;
  epcs?: EpcItem[];
  verification_status?: string;
}

export interface EpcItem {
  id: string;
  name: string;
  epc: string;
}

export interface Editor {
  id: string;
  name: string;
}

export interface StockMovementType {
  id: string;
  name: StockMovementTypeNameEnum;
  direction: StockMovementTypeDirectionEnum;
}

export enum StockMovementTypeDirectionEnum {
  INBOUND = "INBOUND",
  OUTBOUND = "OUTBOUND",
  LEDGER = "LEDGER",
}

export enum StockMovementTypeNameEnum {
  PURCHASING_INBOUND = "PURCHASING_INBOUND",
  RETURN_INBOUND = "RETURN_INBOUND",
  EXCHANGE_INBOUND = "EXCHANGE_INBOUND",
  SELLING_OUTBOUND = "SELLING_OUTBOUND",
  EXCHANGING_OUTBOUND = "EXCHANGING_OUTBOUND",
  REPAIRING_OUTBOUND = "REPAIRING_OUTBOUND",
  WRITTEN_OFF_OUTBOUND = "WRITTEN_OFF_OUTBOUND",
  STOCK_SHIFTING = "STOCK_SHIFTING",
  STORE_GOODS_TRANSFER = "STORE_GOODS_TRANSFER",
  LAMINA_INBOUND = "LAMINA_INBOUND",
  LAMINA_OUTBOUND = "LAMINA_OUTBOUND",
  ST_KERING_STORED = "ST_KERING_STORED",
  ST_KERING_OUTBOUND = "ST_KERING_OUTBOUND",
  PENERIMAAN_LOG_INBOUND = "PENERIMAAN_LOG_INBOUND",
  PENERIMAAN_LOG_OUTBOUND = "PENERIMAAN_LOG_OUTBOUND",
  PENERIMAAN_LOG_STORED = "PENERIMAAN_LOG_STORED",
  SAWMILL_OUTBOUND = "SAWMILL_OUTBOUND",
  ST_BASAH_STORED = "ST_BASAH_STORED",
  ST_BASAH_OUTBOUND = "ST_BASAH_OUTBOUND",
  LEDGER = "LEDGER",
  LEDGER_PACKING = "LEDGER_PACKING",
}

export interface Section {
  id: string;
  name: string;
}

export interface NewItemStatusHistory {
  item: Item;
  changed_at: string;
}

export interface Item {
  id: string;
  epc: string | null;
  sku: Sku;
  status: Status;
  section: Section2;
  packing_collection?: PackingCollection;
  store: {
    id: string | null;
    name: string | null;
  };
  expiry_date: string | null;
  updated_at: string;
  aging: string | null;
  rfid_detail?: RfidItemType;
  rfid_tag_histories?: RfidTagHistory[];
}

export interface RfidTagHistory {
  id: number;
  rfid: RfidItemType;
}

export interface Sku {
  id: string;
  sku: string;
  name: string;
  internal_code: string | null;
  image_urls: string[];
  status: string;
  brand: Brand;
  color: Color;
  size: Size;
  categories: Category[];
  attributes?: Array<{
    attribute_id: string;
    Name?: string;
    name?: string;
    Description?: string;
    description?: string;
    Type?: string;
    type?: string;
    Values?: string[];
    values?: string[];
  }>;
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

export interface Category {
  id: string;
  name: string;
  subcategory: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
}

export interface Status {
  id: string;
  name: string;
}

export interface Section2 {
  id: string | null;
  name: string | null;
}

export interface PackingCollection {
  id: string;
  name: string;
  description: string;
}
// This is the data structure of ApiResponse<StockMovementResponse>.data
export interface StockMovementResponse {
  stock_movements: StockMovementItem[];
}

interface GetStockMovementDataParams {
  filters?: InboundFilterOptions;
  organizationId: string;
  storeId: string;
}

export const getStockMovementDataService = async ({
  filters,
  organizationId,
  storeId,
}: GetStockMovementDataParams): Promise<ApiResponse<StockMovementResponse>> => {
  // Extract stock_movement_type_ids for special handling
  const { stock_movement_type_ids, status_ids, category_ids, parent_category_ids, ...otherFilters } =
    filters || {};

  // Create API params with default order_direction set to DESC (newest to oldest)
  const params: Record<string, unknown> = {
    order_direction: "DESC",
    ...otherFilters,
  };

  // Add stock_movement_type_ids as a string if it exists
  if (stock_movement_type_ids && stock_movement_type_ids.length > 0) {
    params.stock_movement_type_ids = stock_movement_type_ids.join(",");
  }

  if (status_ids && status_ids.length > 0) {
    params.status_ids = status_ids.join(",");
  }

  // Build URL manually to support repeated params for category_ids
  const baseUrl = `/v1/organizations/${organizationId}/stores/${storeId}/stock-movements`;
  const urlParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      urlParams.append(key, String(value));
    }
  });
  if (category_ids && category_ids.length > 0) {
    category_ids.forEach((id) => urlParams.append("category_ids", id));
  }
  if (parent_category_ids && parent_category_ids.length > 0) {
    parent_category_ids.forEach((id) => urlParams.append("parent_category_ids", id));
  }
  const fullUrl = urlParams.toString() ? `${baseUrl}?${urlParams.toString()}` : baseUrl;

  return fetcher({
    method: "GET",
    url: fullUrl,
  });
};
