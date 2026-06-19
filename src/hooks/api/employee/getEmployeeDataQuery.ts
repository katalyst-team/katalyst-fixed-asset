import { useQuery } from "@tanstack/react-query";

import {
  GetEmployeeDataResponse,
  getEmployeeDataService,
} from "@/services/employee/getEmployeeDataService";
import { EmployeeFilterOptions } from "@/types/employee";

interface UseGetEmployeeDataQueryParams {
  organizationId: string;
  filters?: EmployeeFilterOptions;
}

export const KEY_USE_GET_EMPLOYEE_DATA = (
  organizationId: string,
  filters?: EmployeeFilterOptions
) => ["employeeData", organizationId, ...Object.values(filters ?? {})];

const useGetEmployeeDataQuery = ({
  organizationId,
  filters,
}: UseGetEmployeeDataQueryParams) => {
  return useQuery<GetEmployeeDataResponse, Error>({
    enabled: !!organizationId,
    queryFn: () => getEmployeeDataService({ filters, organizationId }),
    queryKey: KEY_USE_GET_EMPLOYEE_DATA(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetEmployeeDataQuery;
