import fetcher, { ApiResponse } from "..";

export interface DeleteEmployeeDataResponse
  extends ApiResponse<{ id: string }> {
  id: string;
}

export interface DeleteEmployeeDataParams {
  organizationId: string;
  accountOrganizationId: string;
}

export const deleteEmployeeDataService = async ({
  organizationId,
  accountOrganizationId,
}: DeleteEmployeeDataParams): Promise<DeleteEmployeeDataResponse> => {
  const url = `/v1/organizations/${organizationId}/accounts/${accountOrganizationId}`;
  return fetcher({
    method: "DELETE",
    url,
  });
};
