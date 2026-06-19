export interface SKUAtributeItemType {
  attribute_id: string;
  // uppercase variants (legacy — some API responses still use these)
  Description: string;
  Name: string;
  Type: "TEXT" | "NUMBER" | "BOOLEAN" | "SELECT" | "DATE" | "DATETIME" | "CHECKBOX" | "REFERENCE_GROUP";
  Values: string[] | null;
  // lowercase variants (current API responses)
  description?: string;
  name?: string;
  resolved_values?: { id: string; name: string }[] | null;
  type?: "TEXT" | "NUMBER" | "BOOLEAN" | "SELECT" | "DATE" | "DATETIME" | "CHECKBOX" | "REFERENCE_GROUP";
  values?: string[] | null;
}

export type AttributeDirection = "INBOUND" | "OUTBOUND";

export interface AttributeItemType {
  id: string;
  name: string;
  type: AttributeTypeEnum;
  direction?: AttributeDirection | null;
  presets: string[] | null;
  unit: string | null;
  created_at: string;
  updated_at: string;
  description: string;
  resolved_values?: { id: string; name: string }[] | null;
}

export enum AttributeTypeEnum {
  BOOLEAN = "BOOLEAN",
  CHECKBOX = "CHECKBOX",
  DATE = "DATE",
  DATETIME = "DATETIME",
  NUMBER = "NUMBER",
  REFERENCE_GROUP = "REFERENCE_GROUP",
  SELECT = "SELECT",
  TEXT = "TEXT",
}

export interface AttributeListResponse {
  attributes: AttributeItemType[] | null;
  cursor: string;
  has_more: boolean;
}

export interface CreateAttributeRequest {
  description?: string;
  direction?: AttributeDirection | null;
  name: string;
  presets?: string[];
  type: AttributeTypeEnum;
  unit?: string | null;
}

export interface UpdateAttributeRequest {
  description?: string;
  direction?: AttributeDirection | null;
  name?: string;
  presets?: string[];
  type?: AttributeTypeEnum;
  unit?: string | null;
}

export interface AttributeResponse {
  id: string;
}
