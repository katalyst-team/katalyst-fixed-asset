import fetcher, { ApiResponse } from "..";

export type LedgerProductSyncStatus =
  | "DONE"
  | "RUNNING"
  | "FAILED"
  | "PENDING"
  | string;

export interface LedgerProductSyncStatusData {
  last_run: string | null;
  next_run: string | null;
  current_time: string | null;
  status: LedgerProductSyncStatus | null;
}

export type LedgerProductSyncStatusResponse = ApiResponse<LedgerProductSyncStatusData>;

interface GetLedgerProductSyncStatusParams {
  organizationId: string;
  storeId: string;
}

export const getLedgerProductSyncStatusService = async ({
  organizationId,
  storeId,
}: GetLedgerProductSyncStatusParams): Promise<LedgerProductSyncStatusResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/sync-nagatech/tambah-barang/status`,
  });
};
