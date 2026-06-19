/**
 * Attribute names for KBM Batang Manual
 * These names are used to find and update attribute presets
 */

export const KBM_ATTRIBUTE_NAMES = {
  KBM_LEBAR: "M_Lebar",
  KBM_NO_PALET: "No Palet",
  KBM_PANJANG: "M_Panjang",
  KBM_PANJANG_LOG: "Panjang Log",
  KBM_TEBAL: "M_Tebal",
} as const;

export type KbmAttributeType =
  | "KBM_PANJANG"
  | "KBM_PANJANG_LOG"
  | "KBM_LEBAR"
  | "KBM_TEBAL"
  | "KBM_NO_PALET";

export type KbmAttributeValueType = "number" | "text";

export type KbmPresetValue = number | string;

export const KBM_ATTRIBUTE_LABELS: Record<KbmAttributeType, string> = {
  KBM_LEBAR: "KBM Lebar",
  KBM_NO_PALET: "No Palet",
  KBM_PANJANG: "KBM Panjang",
  KBM_PANJANG_LOG: "Panjang Log",
  KBM_TEBAL: "KBM Tebal",
};

export const KBM_ATTRIBUTE_VALUE_TYPES: Record<
  KbmAttributeType,
  KbmAttributeValueType
> = {
  KBM_LEBAR: "number",
  KBM_NO_PALET: "text",
  KBM_PANJANG: "number",
  KBM_PANJANG_LOG: "number",
  KBM_TEBAL: "number",
};
