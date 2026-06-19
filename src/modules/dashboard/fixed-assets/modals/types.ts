import type { FaAsset } from "@/types/fixed-assets";

export type FaModalType =
  | "disposal"
  | "checkout"
  | "reservation"
  | "transfer"
  | "transferHistory"
  | "workOrder"
  | "editAsset"
  | "locateAsset"
  | "epcRange"
  | "orderStock"
  | "pmRule"
  | null;

export interface FaModalPayload {
  asset?: FaAsset;
  assetId?: string;
}

export interface FaModalContextValue {
  closeModal: () => void;
  openModal: (type: FaModalType, payload?: FaModalPayload) => void;
  payload: FaModalPayload;
  type: FaModalType;
}

export const FA_PEOPLE = [
  "Andi Pratama",
  "Budi Setiawan",
  "Citra Wijaya",
  "Dewi Anggraini",
  "Dr. Ratna Indira",
  "Eko Pranata",
  "Galang Tirta",
  "Rahmat Santoso",
];

export const FA_LOCATIONS = [
  "BDG-Office · Floor 2",
  "BDG-WH · Bay 1",
  "JKT-DC · Rack B",
  "JKT-HQ · Floor 12",
  "JKT-HQ · Floor 8",
  "JKT-Lab · Station 3",
  "JKT-Workshop",
  "MDN-Office",
  "SBY-WH",
];
