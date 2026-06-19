import fetcher from "@/services";
import { LedgerIdResponse } from "@/types/ledger";

interface DeleteLedgerItemServiceParams {
  organizationId: string;
  storeId: string;
  itemId: string;
}

export const deleteLedgerItemService = async ({
  organizationId,
  storeId,
  itemId,
}: DeleteLedgerItemServiceParams): Promise<LedgerIdResponse> => {
  return fetcher({
    method: "DELETE",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/items/${itemId}`,
  });
};
