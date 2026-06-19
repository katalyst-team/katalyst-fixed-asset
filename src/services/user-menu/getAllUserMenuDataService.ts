import { ApiResponse } from "@/services";
import { GetAllUserMenuDataResponse, UserMenuFilterOptions } from "@/types/user-menu";

import fetcher from "..";

interface GetAllUserMenuDataParams {
  filters?: UserMenuFilterOptions;
  organizationId: string;
}

export const getAllUserMenuDataService = async ({
  filters,
  organizationId,
}: GetAllUserMenuDataParams): Promise<ApiResponse<GetAllUserMenuDataResponse>> => {
  const params = {
    ...filters,
    show_total_count: true,
  };

  return fetcher({
    method: "GET",
    params,
    url: `/v1/organizations/${organizationId}/account-organizations/menus`,
  });
};
