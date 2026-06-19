import {
  isKbmOrganizationId,
  KBM_ATTRIBUTE_ORDER,
} from "@/constants/organization";
import { AttributeTypeEnum } from "@/types/attribute";
import { SkuItemType } from "@/types/sku";
import { formatDisplayTimestamp } from "@/utils/dateTime";

export interface UniqueAttribute {
  id: string;
  name: string;
  type: AttributeTypeEnum;
}

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
 * Extract all unique attributes from an array of SKU items
 * This ensures we have consistent columns for all attributes across all items
 * @param items - Array of SKU items
 * @param organizationId - Optional organization ID for KBM-specific sorting
 */
export const extractUniqueAttributes = (
  items: SkuItemType[],
  organizationId?: string | null,
): UniqueAttribute[] => {
  const attributeMap = new Map<string, UniqueAttribute>();

  items.forEach((item) => {
    if (item.attributes && item.attributes.length > 0) {
      item.attributes.forEach((attr) => {
        if (!attributeMap.has(attr.attribute_id)) {
          const rawType = attr.type ?? attr.Type ?? "";
          const attributeType = Object.values(AttributeTypeEnum).includes(
            rawType as AttributeTypeEnum,
          )
            ? (rawType as AttributeTypeEnum)
            : AttributeTypeEnum.TEXT;

          attributeMap.set(attr.attribute_id, {
            id: attr.attribute_id,
            name: attr.name ?? attr.Name ?? "",
            type: attributeType,
          });
        }
      });
    }
  });

  const attributes = Array.from(attributeMap.values());
  const isKbm = isKbmOrganizationId(organizationId);

  if (isKbm) {
    // Sort by KBM custom order, then alphabetically for attributes not in the list
    return attributes.sort((a, b) => {
      const aIndex = KBM_ATTRIBUTE_ORDER.indexOf(
        a.name as (typeof KBM_ATTRIBUTE_ORDER)[number],
      );
      const bIndex = KBM_ATTRIBUTE_ORDER.indexOf(
        b.name as (typeof KBM_ATTRIBUTE_ORDER)[number],
      );

      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      return (a.name ?? "").localeCompare(b.name ?? "");
    });
  }

  // Sort by name for consistent column ordering (non-KBM)
  return attributes.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
};

const DATE_TYPES = new Set<AttributeTypeEnum>([AttributeTypeEnum.DATE, AttributeTypeEnum.DATETIME]);

const formatAttributeDate = (value: string): string => {
  const formatted = formatDisplayTimestamp(value);
  return formatted !== "-" ? formatted : value;
};

/**
 * Get the attribute value for a specific SKU item and attribute ID
 */
export const getAttributeValue = (
  item: SkuItemType,
  attributeId: string,
): string[] => {
  if (!item.attributes) return [];

  const attribute = item.attributes.find(
    (attr) => attr.attribute_id === attributeId,
  );
  const attributeType = (attribute?.type ?? attribute?.Type ?? "") as
    | AttributeTypeEnum
    | "";
  if (attributeType === AttributeTypeEnum.REFERENCE_GROUP) {
    const resolvedNames =
      attribute?.resolved_values?.map((value) => value.name).filter(Boolean) ??
      [];
    if (resolvedNames.length > 0) {
      return resolvedNames;
    }
  }
  const rawValues = attribute?.values ?? attribute?.Values ?? [];
  if (DATE_TYPES.has(attributeType as AttributeTypeEnum)) {
    return rawValues.map(formatAttributeDate);
  }
  return rawValues;
};

/**
 * Format attribute values for display
 */
export const formatAttributeValues = (values: string[]): string => {
  if (!values || values.length === 0) return "-";
  if (values.length === 1) return values[0];
  return values.join(", ");
};
