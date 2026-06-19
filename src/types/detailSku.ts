export interface DetailSkuItemType {
  no: string;
  epc: string;
  lastUpdate: string;
  lastStatus: string;
}

export interface DetailSkuFilterOptions {
  epc?: string;
  lastStatus?: string;
}

export interface Category {
  label: string;
  value: string;
}
