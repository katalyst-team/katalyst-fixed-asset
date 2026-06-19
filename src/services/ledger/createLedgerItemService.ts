import fetcher from "@/services";
import { CreateLedgerItemParams, LedgerIdResponse } from "@/types/ledger";

interface CreateLedgerItemServiceParams {
  params: CreateLedgerItemParams;
  organizationId: string;
  storeId: string;
}

export const createLedgerItemService = async ({
  params,
  organizationId,
  storeId,
}: CreateLedgerItemServiceParams): Promise<LedgerIdResponse> => {
  return fetcher({
    data: params,
    method: "POST",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/items`,
  });
};
