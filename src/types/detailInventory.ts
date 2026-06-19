import { PaginationResponse } from "./inventory";

export interface InventorySectionItem {
  id: string | null;
  name: string | null;
}

export interface Area {
  name: string;
  id: string;
  section_count: number;
  sections: InventorySectionItem[] | null;
}

export interface DetailInventoryItem {
  no: string;
  epc: string;
  last_update: string;
  last_status: string;
  section_id?: string;
  area_id?: string;
}

export interface SectionsBySkuResponse {
  data: {
    sections: InventorySectionItem[] | null;
  };
  pagination: PaginationResponse;
}

export interface DetailInventoryFilterOptions {
  store_id?: string;
  sku_id: string;
  section_id?: string;
  cursor?: string;
  limit?: number;
}
