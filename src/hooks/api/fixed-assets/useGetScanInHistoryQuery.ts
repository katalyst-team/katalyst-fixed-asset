import { useQuery } from "@tanstack/react-query";

import {
  GetScanInHistoryResponse,
  getScanInHistoryService,
} from "@/services/fixed-assets/getScanInHistoryService";

interface UseGetScanInHistoryQueryParams {
  cursor?: string;
  enabled?: boolean;
  limit?: number;
  organizationId: string;
}

export const KEY_USE_GET_FA_SCAN_IN_HISTORY = (
  organizationId: string,
  filters?: { cursor?: string; limit?: number },
) => ["faScanInHistory", organizationId, JSON.stringify(filters ?? {})];

const useGetScanInHistoryQuery = ({
  cursor,
  enabled = true,
  limit,
  organizationId,
}: UseGetScanInHistoryQueryParams) => {
  const filters = { cursor, limit };

  return useQuery<GetScanInHistoryResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getScanInHistoryService({ ...filters, organizationId }),
    queryKey: KEY_USE_GET_FA_SCAN_IN_HISTORY(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetScanInHistoryQuery;
