import { useQuery } from "@tanstack/react-query";

import {
  GetCheckOutsResponse,
  getCheckOutsService,
} from "@/services/fixed-assets/getCheckOutsService";
import type { FaCheckOutFilterOptions } from "@/types/fixed-assets";

interface UseGetCheckOutsQueryParams extends FaCheckOutFilterOptions {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_CHECK_OUTS = (
  organizationId: string,
  filters?: FaCheckOutFilterOptions,
) => ["faCheckOuts", organizationId, JSON.stringify(filters ?? {})];

const useGetCheckOutsQuery = ({
  enabled = true,
  limit,
  organizationId,
  page,
  status,
}: UseGetCheckOutsQueryParams) => {
  const filters: FaCheckOutFilterOptions = { limit, page, status };

  return useQuery<GetCheckOutsResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getCheckOutsService({ ...filters, organizationId }),
    queryKey: KEY_USE_GET_FA_CHECK_OUTS(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetCheckOutsQuery;
