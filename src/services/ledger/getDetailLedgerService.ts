import { DetailLedgerItemType } from "@/types/detailLedger";

import fetcher, { ApiResponse } from "..";

interface GetDetailLedgerItemParams {
  organizationId: string;
  storeId: string;
  itemId: string;
}

export type GetDetailLedgerItemResponse = ApiResponse<DetailLedgerItemType>;

export const getDetailLedgerItemService = async ({
  organizationId,
  storeId,
  itemId,
}: GetDetailLedgerItemParams): Promise<GetDetailLedgerItemResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/items/${itemId}`,
  });
};
