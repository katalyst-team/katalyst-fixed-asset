import { useQuery } from "@tanstack/react-query";

import {
  GetTransferHistoryResponse,
  getTransferHistoryService,
} from "@/services/fixed-assets/getTransferHistoryService";

interface UseGetTransferHistoryQueryParams {
  cursor?: string;
  enabled?: boolean;
  limit?: number;
  organizationId: string;
}

export const KEY_USE_GET_FA_TRANSFER_HISTORY = (
  organizationId: string,
  filters?: { cursor?: string; limit?: number },
) => ["faTransferHistory", organizationId, JSON.stringify(filters ?? {})];

const useGetTransferHistoryQuery = ({
  cursor,
  enabled = true,
  limit,
  organizationId,
}: UseGetTransferHistoryQueryParams) => {
  const filters = { cursor, limit };

  return useQuery<GetTransferHistoryResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getTransferHistoryService({ ...filters, organizationId }),
    queryKey: KEY_USE_GET_FA_TRANSFER_HISTORY(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetTransferHistoryQuery;
