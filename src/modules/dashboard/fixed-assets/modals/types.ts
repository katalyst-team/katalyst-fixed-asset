import { useUser } from "@/context/user-context";
import { useGetFAMasterDataQuery } from "@/hooks/api/fixed-assets";
import type { FaAsset } from "@/types/fixed-assets";

export type FaModalType =
  | "approvalRule"
  | "disposal"
  | "checkout"
  | "reservation"
  | "transfer"
  | "transferHistory"
  | "workOrder"
  | "createAsset"
  | "editAsset"
  | "locateAsset"
  | "epcRange"
  | "orderStock"
  | "registerTag"
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

export function useFaPeopleOptions() {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: peopleResp } = useGetFAMasterDataQuery({
    organizationId,
    tab: "cust",
  });
  const people =
    peopleResp?.data?.master_data_sections?.flatMap((s) => s?.rows ?? []) ?? [];
  return people
    .filter((p): p is NonNullable<typeof p> => p !== null && p !== undefined)
    .map((p) => ({ label: p.name, value: p.id }));
}

export function useFaLocationOptions() {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: locResp } = useGetFAMasterDataQuery({
    organizationId,
    tab: "loc",
  });
  const locations =
    locResp?.data?.master_data_sections?.flatMap((s) => s?.rows ?? []) ?? [];
  return locations
    .filter((l): l is NonNullable<typeof l> => l !== null && l !== undefined)
    .map((l) => ({ label: l.name, value: l.id }));
}

export function useFaCostCenterOptions() {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: ccResp } = useGetFAMasterDataQuery({
    organizationId,
    tab: "cc",
  });
  const costCenters =
    ccResp?.data?.master_data_sections?.flatMap((s) => s?.rows ?? []) ?? [];
  return costCenters
    .filter((c): c is NonNullable<typeof c> => c !== null && c !== undefined)
    .map((c) => ({ label: c.name, value: c.id }));
}
