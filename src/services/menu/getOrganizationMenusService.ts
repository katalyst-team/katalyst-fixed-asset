import { GetOrganizationMenusResponse } from "@/types/menu";

import fetcher from "..";

interface GetOrganizationMenusParams {
  organizationId: string;
  accountOrganizationId: string;
}

/**
 * Fetches the list of menus for the given organization and account organization.
 * Only menus with user_status "ACTIVE" should be shown in the sidebar.
 */
export const getOrganizationMenusService = async ({
  organizationId,
  accountOrganizationId,
}: GetOrganizationMenusParams): Promise<GetOrganizationMenusResponse> => {
  const url = `/v1/organizations/${organizationId}/account-organizations/${accountOrganizationId}/menus`;
  return fetcher({
    method: "GET",
    url,
  });
};
