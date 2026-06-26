import { useQuery } from "@tanstack/react-query";

import {
  GetScanInHistoryResponse,
  getScanInHistoryService,
} from "@/services/fixed-assets/getScanInHistoryService";

interface UseGetScanInHistoryQueryParams {
  enabled?: boolean;
  limit?: number;
  organizationId: string;
  page?: number;
}

export const KEY_USE_GET_FA_SCAN_IN_HISTORY = (
  organizationId: string,
  filters?: { limit?: number; page?: number },
) => ["faScanInHistory", organizationId, JSON.stringify(filters ?? {})];

const useGetScanInHistoryQuery = ({
  enabled = true,
  limit,
  organizationId,
  page,
}: UseGetScanInHistoryQueryParams) => {
  const filters = { limit, page };

  return useQuery<GetScanInHistoryResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getScanInHistoryService({ ...filters, organizationId }),
    queryKey: KEY_USE_GET_FA_SCAN_IN_HISTORY(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetScanInHistoryQuery;
