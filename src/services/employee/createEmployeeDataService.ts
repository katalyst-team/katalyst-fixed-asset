import { CreateEmployeeParams } from "@/types/employee";

import fetcher, { ApiResponse } from "..";

export interface CreateEmployeeDataResponse
  extends ApiResponse<{ id: string }> {
  id: string;
}

export const createEmployeeDataService = async (
  params: CreateEmployeeParams
): Promise<CreateEmployeeDataResponse> => {
  const url = `/v1/accounts/register-employee`;
  return fetcher({
    data: params,
    method: "POST",
    url,
  });
};
