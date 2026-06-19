/* eslint-disable sort-keys-fix/sort-keys-fix */
import { AttributeTypeEnum } from "@/types/attribute";
import { SkuItemType } from "@/types/sku";

export interface UniqueAttribute {
  id: string;
  name: string;
  type: AttributeTypeEnum;
}

/**
 * Extract all unique attributes from an array of SKU items
 * This ensures we have consistent columns for all attributes across all items
 */
export const extractUniqueAttributes = (
  items: SkuItemType[],
): UniqueAttribute[] => {
  const attributeMap = new Map<string, UniqueAttribute>();

  items.forEach((item) => {
    if (item.attributes && item.attributes.length > 0) {
      item.attributes.forEach((attr) => {
        const attrName = attr.Name ?? attr.name;
        const attrType = attr.Type ?? attr.type;
        if (!attrName || attrName === "G_TYPE") {
          return;
        }
        if (!attributeMap.has(attr.attribute_id)) {
          const attributeType = Object.values(AttributeTypeEnum).includes(
            attrType as AttributeTypeEnum,
          )
            ? (attrType as AttributeTypeEnum)
            : AttributeTypeEnum.TEXT;

          attributeMap.set(attr.attribute_id, {
            id: attr.attribute_id,
            name: attrName,
            type: attributeType,
          });
        }
      });
    }
  });

  // Sort by name for consistent column ordering
  return Array.from(attributeMap.values()).sort((a, b) =>
    (a.name ?? "").localeCompare(b.name ?? ""),
  );
};

/**
 * Get the display value for a specific SKU item and attribute ID.
 */
export const getAttributeValue = (
  item: SkuItemType,
  attributeId: string,
): string[] => {
  if (!item.attributes) return [];

  const attribute = item.attributes.find(
    (attr) => attr.attribute_id === attributeId,
  );
  if (!attribute) return [];

  return attribute.Values ?? attribute.values ?? [];
};

/**
 * Format attribute values for display
 */
export const formatAttributeValues = (values: string[]): string => {
  if (!values || values.length === 0) return "-";
  if (values.length === 1) return values[0];
  return values.join(", ");
};

/**
 * KBM Grade specific attribute name mapping
 * Maps attribute names to their display names
 */
export const KBM_GRADE_ATTRIBUTE_MAP: Record<string, string> = {
  G_KD_GRADE: "Kode Grade",
  G_LEBAR: "Lebar (mm)",
  G_NM_GRADE: "Nama Grade",
  G_PANJANG: "Panjang (mm)",
  G_STD_SUSUN: "Std Susun",
  G_STD_VOL: "Std Vol (m³)",
  G_TEBAL: "Tebal (mm)",
  G_VOL: "Vol (m³)",
  // KBM Barang
  KD_BRG: "Kode Barang",
  NM_BRG: "Nama Barang",
  // KBM Department
  KD_DEP: "Kode Departemen",
  NM_DEP: "Nama Departemen",
  // KBM Gudang
  KD_GUDANG: "Kode Gudang",
  NAMA_GUDANG: "Nama Gudang",
  // KBM Mesin
  NM_MESIN: "Nama Mesin",
  NO_MESIN: "Nomor Mesin",
  // KBM Mitra Bisnis
  KD_MB: "Kode Mitra Bisnis",
  NM_MB: "Nama Mitra Bisnis",
  // KBM Supplier
  KD_SUPPLIER: "Kode Supplier",
  NM_SUPPLIER: "Nama Supplier",
  // KBM Shift
  KD_SHIFT: "Kode Shift",
  NM_SHIFT: "Nama Shift",
};

/**
 * Get display name for an attribute
 */
export const getAttributeDisplayName = (attributeName: string): string => {
  return KBM_GRADE_ATTRIBUTE_MAP[attributeName] || attributeName;
};

/**
 * Format number for display (especially for VOL and STD_VOL)
 */
export const formatNumberValue = (
  value: string,
  decimals: number = 4,
): string => {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num.toFixed(decimals);
};

/**
 * Filter attributes for BATANG type - only show KD Grade (G_KD_GRADE)
 */
export const filterAttributesForBatang = (
  attributes: UniqueAttribute[],
): UniqueAttribute[] => {
  return attributes.filter((attr) => attr.name === "G_KD_GRADE");
};

/**
 * Filter attributes for SUSUN type - show all except G_TYPE
 */
export const filterAttributesForSusun = (
  attributes: UniqueAttribute[],
): UniqueAttribute[] => {
  return attributes.filter((attr) => attr.name !== "G_TYPE");
};
