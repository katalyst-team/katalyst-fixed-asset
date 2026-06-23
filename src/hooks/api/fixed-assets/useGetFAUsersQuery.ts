import { useQuery } from "@tanstack/react-query";

import {
  GetFAUsersResponse,
  getFAUsersService,
} from "@/services/fixed-assets/getFAUsersService";
import type { FaUserFilterOptions } from "@/types/fixed-assets";

interface UseGetFAUsersQueryParams extends FaUserFilterOptions {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_USERS = (
  organizationId: string,
  filters?: FaUserFilterOptions,
) => ["faUsers", organizationId, JSON.stringify(filters ?? {})];

const useGetFAUsersQuery = ({
  cursor,
  enabled = true,
  limit,
  organizationId,
  q,
  role,
  status,
}: UseGetFAUsersQueryParams) => {
  const filters: FaUserFilterOptions = { cursor, limit, q, role, status };

  return useQuery<GetFAUsersResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getFAUsersService({ ...filters, organizationId }),
    queryKey: KEY_USE_GET_FA_USERS(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetFAUsersQuery;
