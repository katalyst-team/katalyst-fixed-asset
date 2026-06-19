import { useQuery } from "@tanstack/react-query";

import { ApiResponse } from "@/services";
import { getUserMenuListService } from "@/services/user-menu/getUserMenuListService";
import { GetAllUserMenuDataResponse } from "@/types/user-menu";

interface UseGetUserMenuListQueryParams {
  organizationId: string;
}

export const KEY_USE_GET_USER_MENU_LIST = (organizationId: string) => [
  "userMenuList",
  organizationId,
];

const useGetUserMenuListQuery = ({
  organizationId,
}: UseGetUserMenuListQueryParams) => {
  return useQuery<ApiResponse<GetAllUserMenuDataResponse>, Error>({
    enabled: !!organizationId,
    queryFn: () => getUserMenuListService({ organizationId }),
    queryKey: KEY_USE_GET_USER_MENU_LIST(organizationId),
    staleTime: 60 * 1000,
  });
};

export default useGetUserMenuListQuery;
