import fetcher, { ApiResponse } from "..";

export interface PostLedgerProductSyncParams {
  organizationId: string;
  storeId: string;
}

export type PostLedgerProductSyncResponse = ApiResponse<{
  ids: string[];
}>;

export const postLedgerProductSyncService = async ({
  organizationId,
  storeId,
}: PostLedgerProductSyncParams): Promise<PostLedgerProductSyncResponse> => {
  return fetcher({
    method: "POST",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/sync-nagatech/tambah-barang`,
  });
};
