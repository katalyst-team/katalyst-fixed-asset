import { GetAllUserMenuDataResponse } from "@/types/user-menu";

import fetcher, { ApiResponse } from "..";

interface GetUserMenuListParams {
  organizationId: string;
}

export const getUserMenuListService = async ({
  organizationId,
}: GetUserMenuListParams): Promise<ApiResponse<GetAllUserMenuDataResponse>> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/account-organizations/menus`,
  });
};
