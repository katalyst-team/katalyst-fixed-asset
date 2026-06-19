import { useQuery } from "@tanstack/react-query";

import { ApiResponse } from "@/services";
import { getUserMenuDataService } from "@/services/user-menu/getUserMenuDataService";
import { GetUserMenuDataResponse } from "@/types/user-menu";

interface UseGetUserMenuDataQueryParams {
  organizationId: string;
  accountOrganizationId: string;
  enabled?: boolean;
}

export const KEY_USE_GET_USER_MENU_DATA = (
  organizationId: string,
  accountOrganizationId: string
) => ["userMenuData", organizationId, accountOrganizationId];

const useGetUserMenuDataQuery = ({
  organizationId,
  accountOrganizationId,
  enabled = true,
}: UseGetUserMenuDataQueryParams) => {
  return useQuery<ApiResponse<GetUserMenuDataResponse>, Error>({
    enabled: !!organizationId && !!accountOrganizationId && enabled,
    queryFn: () =>
      getUserMenuDataService({ accountOrganizationId, organizationId }),
    queryKey: KEY_USE_GET_USER_MENU_DATA(organizationId, accountOrganizationId),
    staleTime: 60 * 1000,
  });
};

export default useGetUserMenuDataQuery;
