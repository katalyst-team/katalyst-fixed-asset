import { useQuery } from "@tanstack/react-query";

import { getRoleDataService } from "@/services/role/getRoleDataService";
import { RoleGetAllResponse } from "@/types/role";

interface UseGetRoleDataQueryParams {
  organizationId: string;
}

export const KEY_USE_GET_ROLE_DATA = (organizationId: string) => [
  "roleData",
  organizationId,
];

const useGetRoleDataQuery = ({ organizationId }: UseGetRoleDataQueryParams) => {
  return useQuery<RoleGetAllResponse, Error>({
    queryFn: () => getRoleDataService({ organizationId }),
    queryKey: KEY_USE_GET_ROLE_DATA(organizationId),
    staleTime: 60 * 1000, // 60 seconds
  });
};

export default useGetRoleDataQuery;
