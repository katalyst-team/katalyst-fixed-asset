import { useQuery } from "@tanstack/react-query";

import {
  GetRolesResponse,
  getRolesService,
} from "@/services/fixed-assets/getRolesService";

interface UseGetRolesQueryParams {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_ROLES = (organizationId: string) => [
  "faRoles",
  organizationId,
];

const useGetRolesQuery = ({
  enabled = true,
  organizationId,
}: UseGetRolesQueryParams) => {
  return useQuery<GetRolesResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getRolesService({ organizationId }),
    queryKey: KEY_USE_GET_FA_ROLES(organizationId),
    staleTime: 60 * 1000,
  });
};

export default useGetRolesQuery;
