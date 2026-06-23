import { useQuery } from "@tanstack/react-query";

import {
  GetTransfersResponse,
  getTransfersService,
} from "@/services/fixed-assets/getTransfersService";
import type { FaTransferFilterOptions } from "@/types/fixed-assets";

interface UseGetTransfersQueryParams extends FaTransferFilterOptions {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_TRANSFERS = (
  organizationId: string,
  filters?: FaTransferFilterOptions,
) => ["faTransfers", organizationId, JSON.stringify(filters ?? {})];

const useGetTransfersQuery = ({
  cursor,
  enabled = true,
  limit,
  organizationId,
  status,
}: UseGetTransfersQueryParams) => {
  const filters: FaTransferFilterOptions = { cursor, limit, status };

  return useQuery<GetTransfersResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getTransfersService({ ...filters, organizationId }),
    queryKey: KEY_USE_GET_FA_TRANSFERS(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetTransfersQuery;
