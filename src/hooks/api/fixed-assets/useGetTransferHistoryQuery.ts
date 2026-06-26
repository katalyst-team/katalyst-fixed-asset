import { useQuery } from "@tanstack/react-query";

import {
  GetTransferHistoryResponse,
  getTransferHistoryService,
} from "@/services/fixed-assets/getTransferHistoryService";

interface UseGetTransferHistoryQueryParams {
  enabled?: boolean;
  limit?: number;
  organizationId: string;
  page?: number;
}

export const KEY_USE_GET_FA_TRANSFER_HISTORY = (
  organizationId: string,
  filters?: { limit?: number; page?: number },
) => ["faTransferHistory", organizationId, JSON.stringify(filters ?? {})];

const useGetTransferHistoryQuery = ({
  enabled = true,
  limit,
  organizationId,
  page,
}: UseGetTransferHistoryQueryParams) => {
  const filters = { limit, page };

  return useQuery<GetTransferHistoryResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getTransferHistoryService({ ...filters, organizationId }),
    queryKey: KEY_USE_GET_FA_TRANSFER_HISTORY(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetTransferHistoryQuery;
