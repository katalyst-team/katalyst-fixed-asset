import { isKbmOrganizationId, KBM_ATTRIBUTE_ORDER } from "@/constants/organization";
import {
  Item,
  StockMovementItem,
} from "@/services/stockMovement/getStockMovementDataService";
import { AttributeTypeEnum } from "@/types/attribute";

export interface CommonAttribute {
  id: string;
  name: string;
  type: AttributeTypeEnum;
}

type SkuAttributeLike = {
  attribute_id: string;
  // API may return either casing
  Name?: string;
  name?: string;
  Type?: string;
  type?: string;
  resolved_values?: { id: string; name: string }[] | null;
  Values?: string[] | null;
  values?: string[] | null;
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
  if (!name) return "";
  return name
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getHistoryItem = (movement: StockMovementItem) =>
  movement.new_item_status_histories?.[0]?.item ?? null;

/**
 * Get RFID detail from item, with fallback to rfid_tag_histories and epcs
 */
export const getRfidDetail = (item: Item | null, movement?: StockMovementItem) => {
  if (!item) return null;
  
  // If rfid_detail exists and has valid data, use it
  if (item.rfid_detail?.epc) {
    return item.rfid_detail;
  }
  
  // Fallback to first rfid_tag_history if rfid_detail is empty
  if (item.rfid_tag_histories && item.rfid_tag_histories.length > 0) {
    return item.rfid_tag_histories[0].rfid;
  }
  
  // Fallback to epcs from stock movement
  if (movement?.epcs && movement.epcs.length > 0) {
    const epc = movement.epcs[0];
    return {
      epc: epc.epc,
      id: epc.id,
      name: epc.name,
    };
  }
  
  return null;
};

export const extractCommonAttributes = (
  movements: StockMovementItem[],
  organizationId?: string | null
): CommonAttribute[] => {
  if (movements.length === 0) return [];

  const isKbm = isKbmOrganizationId(organizationId);
  const unionMap = new Map<string, CommonAttribute>();

  for (const movement of movements) {
    const attributes = getHistoryItem(movement)?.sku?.attributes as
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
          name: attribute.name ?? attribute.Name ?? "",
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

      return (a.name ?? "").localeCompare(b.name ?? "");
    });
  }

  return attributes.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
};

export const getAttributeValues = (
  attributes: SkuAttributeLike[] | null | undefined,
  attributeId: string
): string[] => {
  if (!attributes || attributes.length === 0) return [];
  const attribute = attributes.find(
    (item) => item.attribute_id === attributeId
  );
  const attributeType = (attribute?.type ?? attribute?.Type ?? "") as
    | AttributeTypeEnum
    | "";
  if (attributeType === AttributeTypeEnum.REFERENCE_GROUP) {
    const resolvedNames =
      attribute?.resolved_values?.map((item) => item.name).filter(Boolean) ?? [];
    if (resolvedNames.length > 0) {
      return resolvedNames;
    }
  }
  return attribute?.values ?? attribute?.Values ?? [];
};

export const formatAttributeValues = (values: string[] | null | undefined) => {
  if (!values || values.length === 0) return "-";
  if (values.length === 1) return values[0] ?? "-";
  return values.filter(Boolean).join(", ");
};
