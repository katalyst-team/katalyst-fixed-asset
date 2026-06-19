import {
  UpsertUserMenuParams,
  UpsertUserMenuResponse,
} from "@/types/user-menu";

import fetcher, { ApiResponse } from "..";

interface UpsertUserMenuDataParams {
  organizationId: string;
  accountOrganizationId: string;
  params: UpsertUserMenuParams;
}

export const upsertUserMenuDataService = async ({
  organizationId,
  accountOrganizationId,
  params,
}: UpsertUserMenuDataParams): Promise<ApiResponse<UpsertUserMenuResponse>> => {
  return fetcher({
    data: params,
    method: "POST",
    url: `/v1/organizations/${organizationId}/account-organizations/${accountOrganizationId}/menus`,
  });
};
