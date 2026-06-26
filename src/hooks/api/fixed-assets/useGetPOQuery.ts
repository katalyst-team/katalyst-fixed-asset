import { useQuery } from "@tanstack/react-query";

import {
  GetPOResponse,
  getPOService,
} from "@/services/fixed-assets/getPOService";
import type { FaPOFilterOptions } from "@/types/fixed-assets";

interface UseGetPOQueryParams extends FaPOFilterOptions {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_PO = (
  organizationId: string,
  filters?: FaPOFilterOptions,
) => ["faPO", organizationId, JSON.stringify(filters ?? {})];

const useGetPOQuery = ({
  enabled = true,
  limit,
  organizationId,
  page,
  status,
}: UseGetPOQueryParams) => {
  const filters: FaPOFilterOptions = { limit, page, status };

  return useQuery<GetPOResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getPOService({ ...filters, organizationId }),
    queryKey: KEY_USE_GET_FA_PO(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetPOQuery;
