export const KBM_ORGANIZATION_IDS = [
  "003e43c6-8f3d-441e-a817-ab867e1cbd82", // Release
  "bd55471e-81dd-4c4a-8cdf-d1a9675fb8ad", // Stg/Debug
] as const;

/**
 * Custom sort order for KBM organization attributes
 * Uses original attribute names as they appear in the API
 * This order is used across all KBM-related features for consistent column ordering
 */
export const KBM_ATTRIBUTE_ORDER = [
  "RST Kering Type",
  "Grade RST Kering",
  "Jumlah Batang",
  "Jumlah Susun",
  "Tebal",
  "Lebar",
  "Panjang",
  "Asal Kayu",
  "Tanggal Input ST Kering",
  "SUPPLIER",
  "NON_STD",
  "KD_MB",
  "NM_MB",
  "NM_MESIN",
  "NO_MESIN",
  "NM_BRG",
  "KD_BRG",
  "KD_DEP",
  "NM_DEP",
  "Keterangan",
] as const;

export const isKbmOrganizationId = (organizationId: string | null | undefined): boolean => {
  if (!organizationId) return false;
  return KBM_ORGANIZATION_IDS.includes(organizationId as (typeof KBM_ORGANIZATION_IDS)[number]);
};
