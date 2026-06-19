import { useQuery } from "@tanstack/react-query";

import { ApiResponse } from "@/services";
import { getAllUserMenuDataService } from "@/services/user-menu/getAllUserMenuDataService";
import { GetAllUserMenuDataResponse, UserMenuFilterOptions } from "@/types/user-menu";

interface UseGetAllUserMenuDataQueryParams {
  filters?: UserMenuFilterOptions;
  organizationId: string;
}

export const KEY_USE_GET_ALL_USER_MENU_DATA = (
  organizationId: string,
  filters?: UserMenuFilterOptions,
) => ["allUserMenuData", organizationId, JSON.stringify(filters)];

const useGetAllUserMenuDataQuery = ({
  filters,
  organizationId,
}: UseGetAllUserMenuDataQueryParams) => {
  return useQuery<ApiResponse<GetAllUserMenuDataResponse>, Error>({
    enabled: !!organizationId,
    queryFn: () => getAllUserMenuDataService({ filters, organizationId }),
    queryKey: KEY_USE_GET_ALL_USER_MENU_DATA(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetAllUserMenuDataQuery;
