import { RfidCategory } from "./rfid";
import { SkuType } from "./sku";

export interface StockMovementProductItemType {
  no: string;
  productName: string;
  quantity: number;
  lastStatus: string;
  skuId?: string;
  category: string; // SKU category name from API
  skuType?: SkuType;
}

export interface StockMovementEpcItemType {
  no: string;
  epc: string;
  rfidName?: string;
  lastUpdate: string;
  lastStatus: string;
  skuId: string;
  skuName: string;
  id?: string;
  itemId?: string;
  storeId?: string;
  category: RfidCategory;
  metadata?: Record<string, unknown> | null;
}

export interface StockMovementHistoryItemType {
  no: string;
  status: string;
  lastUpdate: string;
  operator: string;
}
