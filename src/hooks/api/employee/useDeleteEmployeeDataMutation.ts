import { useMutation, UseMutationResult } from "@tanstack/react-query";

import { useUser } from "@/context/user-context";
import {
  DeleteEmployeeDataParams,
  DeleteEmployeeDataResponse,
  deleteEmployeeDataService,
} from "@/services/employee/deleteEmployeeDataService";

export type UseDeleteEmployeeDataMutationResponse = UseMutationResult<
  DeleteEmployeeDataResponse,
  Error,
  Omit<DeleteEmployeeDataParams, "organizationId">,
  unknown
>;

export const USE_DELETE_EMPLOYEE_DATA_MUTATION_KEY = () => [
  "deleteEmployeeData",
];

const useDeleteEmployeeDataMutation =
  (): UseDeleteEmployeeDataMutationResponse => {
    const { tokenPayload } = useUser();

    const mutation = useMutation({
      mutationFn: (params: Omit<DeleteEmployeeDataParams, "organizationId">) =>
        deleteEmployeeDataService({
          ...params,
          organizationId: tokenPayload?.organization_id ?? "",
        }),
      mutationKey: USE_DELETE_EMPLOYEE_DATA_MUTATION_KEY(),
    });
    return mutation;
  };

export default useDeleteEmployeeDataMutation;
