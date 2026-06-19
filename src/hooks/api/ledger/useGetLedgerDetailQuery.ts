import { useQuery } from "@tanstack/react-query";

import { getLedgerDetailService } from "@/services/ledger/getLedgerDetailService";
import { LedgerDetailResponse } from "@/types/ledger";

interface UseGetLedgerDetailQueryParams {
  organizationId: string;
  storeId: string;
  itemId: string;
}

export const KEY_USE_GET_LEDGER_DETAIL = (
  organizationId: string,
  storeId: string,
  itemId: string
) => ["ledgerDetail", organizationId, storeId, itemId];

const useGetLedgerDetailQuery = ({
  organizationId,
  storeId,
  itemId,
}: UseGetLedgerDetailQueryParams) => {
  return useQuery<LedgerDetailResponse, Error>({
    queryFn: () =>
      getLedgerDetailService({
        itemId,
        organizationId,
        storeId,
      }),
    queryKey: KEY_USE_GET_LEDGER_DETAIL(organizationId, storeId, itemId),
    staleTime: 60 * 1000, // 60 seconds
  });
};

export default useGetLedgerDetailQuery;
