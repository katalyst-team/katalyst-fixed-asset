/* eslint-disable @typescript-eslint/no-explicit-any */

import { LedgerFilter, LedgerResponse } from "@/types/ledger";

import fetcher, { ApiResponse } from "..";

interface GetLedgerDataParams {
  filters?: LedgerFilter;
  organizationId: string;
  storeId: string;
}

export const getLedgerDataService = async ({
  filters,
  organizationId,
  storeId,
}: GetLedgerDataParams): Promise<ApiResponse<LedgerResponse>> => {
  let tempFilters: any = filters;

  if (filters?.sku_ids) {
    tempFilters = {
      ...filters,
      sku_ids: filters.sku_ids.join(","),
    };
  }
  return fetcher({
    method: "GET",
    params: tempFilters,
    url: `/v1/organizations/${organizationId}/stores/${storeId}/items`,
  });
};
