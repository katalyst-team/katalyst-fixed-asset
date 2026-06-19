import fetcher from "@/services";
import { UpdateLedgerItemParams } from "@/types/ledger";

interface UpdateLedgerItemServiceParams {
  params: UpdateLedgerItemParams;
  organizationId: string;
  storeId: string;
  itemId: string;
}

export const updateLedgerItemService = async ({
  params,
  organizationId,
  storeId,
  itemId,
}: UpdateLedgerItemServiceParams): Promise<unknown> => {
  return fetcher({
    data: params,
    method: "PATCH",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/items/${itemId}`,
  });
};
