export interface DetailSkuProductHistoryItemType {
  no: string;
  status: string;
  lastUpdate: string;
  operator: string;
  quantity: string;
  section: string;
  note: string;
}

export interface DetailSkuProductHistoryFilterOptions {
  status?: string;
}

export interface Category {
  label: string;
  value: string;
}
