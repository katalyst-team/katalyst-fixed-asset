import type { FaRole, UpdateRoleRequest } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type UpdateRoleResponse = ApiResponse<{ role: FaRole }>;

interface UpdateRoleParams {
  data: UpdateRoleRequest;
  organizationId: string;
  roleId: string;
}

export const updateRoleService = async ({
  data,
  organizationId,
  roleId,
}: UpdateRoleParams): Promise<UpdateRoleResponse> => {
  return fetcher({
    data,
    method: "PUT",
    url: `/v1/organizations/${organizationId}/fa/roles/${roleId}`,
  });
};
