import type { FaRole } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetRolesResponse = ApiResponse<{ roles: FaRole[] }>;

interface GetRolesParams {
  organizationId: string;
}

export const getRolesService = async ({
  organizationId,
}: GetRolesParams): Promise<GetRolesResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/roles`,
  });
};
