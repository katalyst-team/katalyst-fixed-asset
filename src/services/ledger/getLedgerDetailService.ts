import fetcher from "@/services";
import { LedgerDetailResponse } from "@/types/ledger";

interface GetLedgerDetailParams {
  organizationId: string;
  storeId: string;
  itemId: string;
}

export const getLedgerDetailService = async ({
  organizationId,
  storeId,
  itemId,
}: GetLedgerDetailParams): Promise<LedgerDetailResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/items/${itemId}`,
  });
};
