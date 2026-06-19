import { useQuery } from "@tanstack/react-query";

import { getMeMenusService } from "@/services/menu/getMeMenusService";
import { GetMeMenusResponse } from "@/types/menu";

interface UseGetMeMenusQueryParams {
  enabled?: boolean;
  organizationId?: string;
}

export const KEY_USE_GET_ME_MENUS = (organizationId?: string) => ["meMenus", organizationId];

/**
 * React Query hook to fetch the authenticated user's effective sidebar menus.
 * Only ACTIVE menus are returned — no client-side filtering needed.
 */
const useGetMeMenusQuery = ({ enabled = true, organizationId }: UseGetMeMenusQueryParams = {}) => {
  return useQuery<GetMeMenusResponse, Error>({
    enabled,
    queryFn: getMeMenusService,
    queryKey: KEY_USE_GET_ME_MENUS(organizationId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export default useGetMeMenusQuery;
