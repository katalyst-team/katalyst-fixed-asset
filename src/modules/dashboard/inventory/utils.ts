import { isKbmOrganizationId, KBM_ATTRIBUTE_ORDER } from "@/constants/organization";
import { AttributeTypeEnum } from "@/types/attribute";
import { InventoryItem } from "@/types/inventory";
import { formatDisplayTimestamp } from "@/utils/dateTime";

export interface InventoryCommonAttribute {
  id: string;
  name: string;
  type: AttributeTypeEnum;
}

type SkuAttributeLike = {
  attribute_id: string;
  name?: string;
  type?: string;
  resolved_values?: { id: string; name: string }[] | null;
  values?: string[] | null;
  // legacy uppercase variants
  Name?: string;
  Type?: string;
  Values?: string[] | null;
};

const normalizeAttributeType = (type: string): AttributeTypeEnum => {
  if (Object.values(AttributeTypeEnum).includes(type as AttributeTypeEnum)) {
    return type as AttributeTypeEnum;
  }
  return AttributeTypeEnum.TEXT;
};

/**
 * Converts attribute name from "NM_DEP" format to "Nm Dep" format
 * Examples: "NM_DEP" -> "Nm Dep", "KD_MB" -> "Kd Mb", "NM_MESIN" -> "Nm Mesin"
 */
export const formatAttributeName = (name: string): string => {
  return name
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Extracts common attributes from all inventory items.
 * Returns attributes that appear in at least one inventory item.
 */
export const extractCommonInventoryAttributes = (
  inventories: InventoryItem[],
  organizationId?: string | null
): InventoryCommonAttribute[] => {
  if (inventories.length === 0) return [];

  const isKbm = isKbmOrganizationId(organizationId);
  const unionMap = new Map<string, InventoryCommonAttribute>();

  for (const inventory of inventories) {
    const attributes = inventory.attributes as
      | SkuAttributeLike[]
      | null
      | undefined;
    if (!attributes || attributes.length === 0) {
      continue;
    }

    for (const attribute of attributes) {
      if (!unionMap.has(attribute.attribute_id)) {
        unionMap.set(attribute.attribute_id, {
          id: attribute.attribute_id,
          name: attribute.name || attribute.Name || "",
          type: normalizeAttributeType(attribute.type ?? attribute.Type ?? ""),
        });
      }
    }
  }

  const attributes = Array.from(unionMap.values());

  if (isKbm) {
    // Sort by KBM custom order, then alphabetically for attributes not in the list
    return attributes.sort((a, b) => {
      const aIndex = KBM_ATTRIBUTE_ORDER.indexOf(a.name as (typeof KBM_ATTRIBUTE_ORDER)[number]);
      const bIndex = KBM_ATTRIBUTE_ORDER.indexOf(b.name as (typeof KBM_ATTRIBUTE_ORDER)[number]);

      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      return a.name.localeCompare(b.name);
    });
  }

  return attributes.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Gets attribute values from inventory attributes array
 */
export const getAttributeValues = (
  attributes: SkuAttributeLike[] | null | undefined,
  attributeId: string
): string[] => {
  if (!attributes || attributes.length === 0) return [];
  const attribute = attributes.find(
    (item) => item.attribute_id === attributeId
  );
  return attribute?.values ?? attribute?.Values ?? [];
};

const DATE_TYPES = new Set<AttributeTypeEnum>([AttributeTypeEnum.DATE, AttributeTypeEnum.DATETIME]);

const formatAttributeDate = (value: string): string => {
  const formatted = formatDisplayTimestamp(value);
  return formatted !== "-" ? formatted : value;
};

export const getDisplayAttributeValues = (
  attributes: SkuAttributeLike[] | null | undefined,
  attributeId: string
): string[] => {
  if (!attributes || attributes.length === 0) return [];
  const attribute = attributes.find((item) => item.attribute_id === attributeId);
  if (!attribute) return [];

  const attributeType = (attribute.type ?? attribute.Type ?? "") as AttributeTypeEnum | "";
  if (attributeType === AttributeTypeEnum.REFERENCE_GROUP) {
    const resolvedNames =
      attribute.resolved_values?.map((item) => item.name).filter(Boolean) ?? [];
    if (resolvedNames.length > 0) {
      return resolvedNames;
    }
  }

  const rawValues = attribute.values ?? attribute.Values ?? [];
  if (DATE_TYPES.has(attributeType as AttributeTypeEnum)) {
    return rawValues.map(formatAttributeDate);
  }

  return rawValues;
};

/**
 * Formats attribute values for display
 */
export const formatAttributeValues = (values: string[] | null | undefined) => {
  if (!values || values.length === 0) return "-";
  if (values.length === 1) return values[0] ?? "-";
  return values.filter(Boolean).join(", ");
};
