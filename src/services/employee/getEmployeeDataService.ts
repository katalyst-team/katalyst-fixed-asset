import { EmployeeFilterOptions, EmployeeItemType } from "@/types/employee";

import fetcher, { ApiResponse } from "..";

interface GetEmployeeDataParams {
  organizationId: string;
  filters?: EmployeeFilterOptions;
}

export interface GetEmployeeDataResponse
  extends ApiResponse<{ account_organizations: EmployeeItemType[] }> {
  account_organizations: EmployeeItemType[];
}

export const getEmployeeDataService = async ({
  organizationId,
  filters,
}: GetEmployeeDataParams): Promise<GetEmployeeDataResponse> => {
  const queryParams = new URLSearchParams();
  if (filters?.query) queryParams.append("query", filters.query);
  if (filters?.status) queryParams.append("status", filters.status);
  if (filters?.store_ids?.length)
    queryParams.append("store_ids", filters.store_ids.join(","));
  if (filters?.role_id) queryParams.append("role_id", filters.role_id);

  const url = `/v1/organizations/${organizationId}/accounts?${queryParams.toString()}`;
  return fetcher({
    method: "GET",
    url,
  });
};
