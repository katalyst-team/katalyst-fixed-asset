import type { FaAsset, FaRfidTag } from "@/types/fixed-assets";

import { CAT_LABEL } from "../constants";

export const FIELD_OPTIONS = [
  { label: "EPC", value: "epc" },
  { label: "TID", value: "tid" },
  { label: "Asset name", value: "asset.name" },
  { label: "Asset code", value: "asset.asset_code" },
  { label: "Serial number", value: "asset.serial" },
  { label: "Category", value: "asset.cat" },
  { label: "Location", value: "asset.loc" },
  { label: "Custodian", value: "asset.custodian" },
  { label: "Purchase date", value: "asset.purchased" },
  { label: "Current date", value: "current_date" },
];

export const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const formatToday = (): string => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}/${now.getFullYear()}`;
};

export const extractZplFields = (zplCode: string): string[] => {
  const fieldRegex = /\[([^\]]+)\]/g;
  const fields: string[] = [];
  let match;
  while ((match = fieldRegex.exec(zplCode)) !== null) {
    if (!fields.includes(match[1])) fields.push(match[1]);
  }
  return fields;
};

export const SAMPLE_TAG: FaRfidTag = {
  asset: "Sample asset",
  asset_id: "",
  encoded_at: "",
  epc: "E2801170000050CA00000000",
  format: "SGTIN-96",
  id: "sample",
  last_read: "",
  notes: null,
  printed: false,
  rssi: 0,
  status: "active",
  tid: "E2-00-SGTI-000000000000",
};

export function resolveTagValues(
  tag: FaRfidTag,
  assetById: Map<string, FaAsset>
): Record<string, string> {
  const asset = tag.asset_id ? assetById.get(tag.asset_id) : undefined;
  return {
    "asset.asset_code": asset?.asset_code ?? "",
    "asset.cat": asset ? (CAT_LABEL[asset.cat] ?? asset.cat) : "",
    "asset.custodian": asset?.custodian ?? "",
    "asset.loc": asset?.loc ?? "",
    "asset.name": asset?.name ?? tag.asset,
    "asset.purchased": asset?.purchased ?? "",
    "asset.serial": asset?.serial ?? "",
    current_date: formatToday(),
    epc: tag.epc,
    tid: tag.tid,
  };
}
