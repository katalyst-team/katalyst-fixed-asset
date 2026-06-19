import { useQuery } from "@tanstack/react-query";

import {
  GetDetailLedgerItemResponse,
  getDetailLedgerItemService,
} from "@/services/ledger/getDetailLedgerService";

export interface UseGetDetailLedgerItemQueryParams {
  organizationId: string;
  storeId: string;
  itemId: string;
  enabled?: boolean;
}

export const USE_GET_DETAIL_LEDGER_ITEM_QUERY_KEY = (
  organizationId: string,
  storeId: string,
  itemId: string
) => ["detailLedgerItem", organizationId, storeId, itemId];

export const useGetDetailLedgerItemQuery = ({
  organizationId,
  storeId,
  itemId,
  enabled,
}: UseGetDetailLedgerItemQueryParams) => {
  return useQuery<GetDetailLedgerItemResponse, Error>({
    enabled: enabled !== undefined ? enabled : Boolean(organizationId && storeId && itemId),
    queryFn: () =>
      getDetailLedgerItemService({
        itemId,
        organizationId,
        storeId,
      }),
    queryKey: USE_GET_DETAIL_LEDGER_ITEM_QUERY_KEY(organizationId, storeId, itemId),
    staleTime: 60 * 1000,
  });
};

export default useGetDetailLedgerItemQuery;
