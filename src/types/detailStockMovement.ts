import { SKUAtributeItemType } from "./attribute";
import { RfidItemType } from "./rfid";
import { VerificationLogEntry, VerificationStatus } from "./verification";

/* eslint-disable @typescript-eslint/no-empty-object-type */
export interface DetailStockMovementResponse extends DetailStockMovementData {}

export interface DetailStockMovementData {
  created_at: string;
  editor: {
    id: string;
    name: string;
  };
  id: string;
  image_urls: string[] | null;
  metadata: Record<string, unknown> | null;
  new_item_status_histories: NewItemStatusHistory[] | null;
  note: string | null;
  quantity: number;
  reference_number: string | null;
  section: {
    id: string;
    name: string;
  };
  stock_movement_type: {
    direction: string;
    id: string;
    name: string;
  };
  store_id: string;
  store_name: string;
  updated_at: string;
  verification_logs?: VerificationLogEntry[] | null;
  verification_status?: VerificationStatus | null;
}

export interface NewItemStatusHistory {
  changed_at: string;
  item: {
    epc: string;
    id: string;
    metadata: Record<string, unknown> | null;
    rfid_detail: RfidItemType;
    packing_collection: null; // Based on the example, this is null
    section: {
      id: string | null;
      name: string | null;
    };
    sku: {
      brand: {
        id: string | null;
        name: string | null;
      };
      categories: {
        id: string;
        name: string;
        subcategory: {
          id: string;
          name: string;
        }[] | null;
      }[] | null;
      attributes: SKUAtributeItemType[] | null;
      color: {
        id: string | null;
        name: string | null;
      };
      id: string;
      image_urls: string[] | null;
      internal_code: string | null;
      name: string;
      size: {
        id: string | null;
        name: string | null;
      };
      sku: string;
      status: string;
      type: string;
    };
    status: {
      id: string;
      name: string;
    };
    store: {
      id: string | null;
      name: string | null;
    };
    expiry_date: string | null;
    updated_at: string;
  };
}

export interface LedgerV2ItemTableRow {
  id: string;
  no: number | string;
  item: string;
  sku: string;
  epc: string | null;
  brand: string;
  category: string;
  subcategory?: string;
  color: string;
  size: string;
  status: string;
  section: string;
  changedAt: string;
  skuId: string;
  attributes: SKUAtributeItemType[];
  rfidCategory?: string | null;
  rfidName?: string | null;
  internalCode?: string | null;
}
