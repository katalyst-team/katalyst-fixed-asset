import { useQuery } from "@tanstack/react-query";

import {
  GetDisposalsResponse,
  getDisposalsService,
} from "@/services/fixed-assets/getDisposalsService";
import type { FaDisposalFilterOptions } from "@/types/fixed-assets";

interface UseGetDisposalsQueryParams extends FaDisposalFilterOptions {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_DISPOSALS = (
  organizationId: string,
  filters?: FaDisposalFilterOptions,
) => ["faDisposals", organizationId, JSON.stringify(filters ?? {})];

const useGetDisposalsQuery = ({
  cursor,
  enabled = true,
  limit,
  organizationId,
  status,
}: UseGetDisposalsQueryParams) => {
  const filters: FaDisposalFilterOptions = { cursor, limit, status };

  return useQuery<GetDisposalsResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getDisposalsService({ ...filters, organizationId }),
    queryKey: KEY_USE_GET_FA_DISPOSALS(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetDisposalsQuery;
