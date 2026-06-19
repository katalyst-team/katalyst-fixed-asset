export enum EdgeConfigRfidTagStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface EdgeConfigStockMovementType {
  direction: string;
  id: string;
  name: string;
}

export interface SkuAttributeUpdate {
  attribute_id: string;
  default_value?: "now";
  values?: string[];
}

export interface EdgeConfigItemType {
  antenna: number | null;
  current_stock_movement_type: EdgeConfigStockMovementType;
  device_id: string | null;
  id: string;
  name: string;
  next_stock_movement_type: EdgeConfigStockMovementType;
  operator_account_name: string | null;
  operator_aor_id: string | null;
  organization_id: string;
  parent_category_ids?: string[] | null;
  rfid_tag_status: EdgeConfigRfidTagStatus | null;
  sku_attribute_updates?: SkuAttributeUpdate[];
  store_id: string | null;
  store_name?: string | null;
}

export interface EdgeConfigFilterOptions {
  cursor?: string;
  limit?: number;
}

export interface EdgeConfigResponse {
  configs: EdgeConfigItemType[];
}

export interface CreateEdgeConfigPayload {
  antenna?: number;
  current_stock_movement_type_id: string;
  device_id?: string;
  name?: string;
  next_stock_movement_type_id: string;
  operator_aor_id?: string;
  parent_category_ids?: string[];
  rfid_tag_status?: EdgeConfigRfidTagStatus;
  sku_attribute_updates?: SkuAttributeUpdate[];
  store_id?: string;
}

export interface UpdateEdgeConfigPayload {
  antenna?: number;
  device_id?: string | null;
  name?: string;
  next_stock_movement_type_id?: string;
  operator_aor_id?: string | null;
  parent_category_ids?: string[];
  rfid_tag_status?: EdgeConfigRfidTagStatus;
  sku_attribute_updates?: SkuAttributeUpdate[];
  store_id?: string;
}

export interface EdgeConfigMutationResponse {
  id: string;
}
