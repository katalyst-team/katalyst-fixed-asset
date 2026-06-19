import { GetUserMenuDataResponse } from "@/types/user-menu";

import fetcher, { ApiResponse } from "..";

interface GetUserMenuDataParams {
  organizationId: string;
  accountOrganizationId: string;
}

export const getUserMenuDataService = async ({
  organizationId,
  accountOrganizationId,
}: GetUserMenuDataParams): Promise<ApiResponse<GetUserMenuDataResponse>> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/account-organizations/${accountOrganizationId}/menus`,
  });
};
