import { useMutation, UseMutationResult } from "@tanstack/react-query";

import { useUser } from "@/context/user-context";
import {
  UpdateEmployeeDataParams,
  UpdateEmployeeDataResponse,
  updateEmployeeDataService,
} from "@/services/employee/updateEmployeeDataService";

export type UseUpdateEmployeeDataMutationResponse = UseMutationResult<
  UpdateEmployeeDataResponse,
  Error,
  Omit<UpdateEmployeeDataParams, "organizationId">,
  unknown
>;

export const USE_UPDATE_EMPLOYEE_DATA_MUTATION_KEY = () => [
  "updateEmployeeData",
];

const useUpdateEmployeeDataMutation =
  (): UseUpdateEmployeeDataMutationResponse => {
    const { tokenPayload } = useUser();

    const mutation = useMutation({
      mutationFn: (params: Omit<UpdateEmployeeDataParams, "organizationId">) =>
        updateEmployeeDataService({
          ...params,
          organizationId: tokenPayload?.organization_id ?? "",
        }),
      mutationKey: USE_UPDATE_EMPLOYEE_DATA_MUTATION_KEY(),
    });
    return mutation;
  };

export default useUpdateEmployeeDataMutation;
