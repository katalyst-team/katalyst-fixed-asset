import { useQuery } from "@tanstack/react-query";

import { ApiResponse } from "@/services";
import { getLedgerDataService } from "@/services/ledger/getLedgerDataService";
import { LedgerFilter, LedgerResponse } from "@/types/ledger";

interface UseGetLedgerDataQueryParams {
  filters?: LedgerFilter;
  organizationId: string;
  storeId: string;
  enabled?: boolean;
}

export const KEY_USE_GET_LEDGER_DATA = (
  organizationId: string,
  storeId: string,
  filters?: LedgerFilter
) => ["ledgerData", organizationId, storeId, JSON.stringify(filters)];

const useGetLedgerDataQuery = ({
  filters,
  organizationId,
  storeId,
  enabled = true,
}: UseGetLedgerDataQueryParams) => {
  return useQuery<ApiResponse<LedgerResponse>, Error>({
    enabled: Boolean(organizationId) && Boolean(storeId) && enabled,
    queryFn: () =>
      getLedgerDataService({
        filters,
        organizationId,
        storeId,
      }),
    queryKey: KEY_USE_GET_LEDGER_DATA(organizationId, storeId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetLedgerDataQuery;
