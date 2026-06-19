import { useQuery } from "@tanstack/react-query";

import { getOrganizationMenusService } from "@/services/menu/getOrganizationMenusService";
import { GetOrganizationMenusResponse } from "@/types/menu";

interface UseGetOrganizationMenusQueryParams {
  accountOrganizationId: string;
  organizationId: string;
}

export const KEY_USE_GET_ORGANIZATION_MENUS = (
  organizationId: string,
  accountOrganizationId: string,
) => ["organizationMenus", organizationId, accountOrganizationId];

/**
 * React Query hook to fetch menus for an organization and account organization.
 * Only menus with user_status "ACTIVE" should be shown in the sidebar.
 */
const useGetOrganizationMenusQuery = ({
  accountOrganizationId,
  organizationId,
}: UseGetOrganizationMenusQueryParams) => {
  return useQuery<GetOrganizationMenusResponse, Error>({
    enabled: Boolean(accountOrganizationId && organizationId),
    queryFn: () =>
      getOrganizationMenusService({ accountOrganizationId, organizationId }),
    queryKey: KEY_USE_GET_ORGANIZATION_MENUS(
      accountOrganizationId,
      organizationId,
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes - menu visibility doesn't change often
  });
};

export default useGetOrganizationMenusQuery;
