export interface StoreItemType {
  id: string;

  name: string;
  address: string;
  status: string;
}

export interface StoreFilterOptions {
  storeName?: string;
  status?: string;
}

export interface Category {
  label: string;
  value: string;
}

export interface PostStoreDataParams {
  storeName: string;
  status: string;
  organization_id: string;
}

export interface PatchStoreDataParams {
  storeID: string;
  storeName: string;
  status: string;
  organizationID: string;
}

// Store Area interfaces
export interface StoreAreaItemType {
  id: string;
  name: string;
  store_id: string;
  status?: string;
}

export interface StoreAreaFilterOptions {
  areaName?: string;
}

export interface PostStoreAreaDataParams {
  areaName: string;
  storeId: string;
  organizationId: string;
}

export interface PatchStoreAreaDataParams {
  areaId: string;
  areaName: string;
  storeId: string;
  organizationId: string;
}
