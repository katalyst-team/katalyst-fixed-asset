import { useQuery } from "@tanstack/react-query";

import {
  getLedgerProductSyncStatusService,
} from "@/services/ledger-product/getLedgerProductSyncStatusService";

interface UseGetLedgerProductSyncStatusQueryParams {
  organizationId: string;
  storeId: string;
  enabled?: boolean;
}

export const USE_GET_LEDGER_PRODUCT_SYNC_STATUS_QUERY_KEY = (
  organizationId: string,
  storeId: string
) => ["ledger-product-sync-status", organizationId, storeId];

export const useGetLedgerProductSyncStatusQuery = ({
  enabled = true,
  organizationId,
  storeId,
}: UseGetLedgerProductSyncStatusQueryParams) => {
  return useQuery({
    enabled: Boolean(organizationId && storeId) && enabled,
    queryFn: () => getLedgerProductSyncStatusService({ organizationId, storeId }),
    queryKey: USE_GET_LEDGER_PRODUCT_SYNC_STATUS_QUERY_KEY(organizationId, storeId),
    staleTime: 30 * 1000,
  });
};
