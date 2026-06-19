import fetcher from "@/services";
import { RoleGetAllResponse } from "@/types/role";

interface GetRoleDataParams {
  organizationId: string;
}

export const getRoleDataService = async ({
  organizationId,
}: GetRoleDataParams): Promise<RoleGetAllResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/roles`,
  });
};
