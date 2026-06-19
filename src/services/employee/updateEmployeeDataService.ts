import { UpdateEmployeeParams } from "@/types/employee";

import fetcher, { ApiResponse } from "..";

export interface UpdateEmployeeDataResponse
  extends ApiResponse<{ id: string }> {
  id: string;
}

export interface UpdateEmployeeDataParams extends UpdateEmployeeParams {
  organizationId: string;
  accountOrganizationId: string;
}

export const updateEmployeeDataService = async ({
  organizationId,
  accountOrganizationId,
  ...data
}: UpdateEmployeeDataParams): Promise<UpdateEmployeeDataResponse> => {
  const url = `/v1/organizations/${organizationId}/accounts/${accountOrganizationId}`;
  return fetcher({
    data,
    method: "PATCH",
    url,
  });
};
