import { useMutation, UseMutationResult } from "@tanstack/react-query";

import { useUser } from "@/context/user-context";
import {
  CreateEmployeeDataResponse,
  createEmployeeDataService,
} from "@/services/employee/createEmployeeDataService";
import { CreateEmployeeParams } from "@/types/employee";

export type UseCreateEmployeeDataMutationResponse = UseMutationResult<
  CreateEmployeeDataResponse,
  Error,
  Omit<CreateEmployeeParams, "organization_id">,
  unknown
>;

export const USE_CREATE_EMPLOYEE_DATA_MUTATION_KEY = () => [
  "createEmployeeData",
];

const useCreateEmployeeDataMutation =
  (): UseCreateEmployeeDataMutationResponse => {
    const { tokenPayload } = useUser();

    const mutation = useMutation({
      mutationFn: (params: Omit<CreateEmployeeParams, "organization_id">) =>
        createEmployeeDataService({
          ...params,
          organization_id: tokenPayload?.organization_id ?? "",
        }),
      mutationKey: USE_CREATE_EMPLOYEE_DATA_MUTATION_KEY(),
    });
    return mutation;
  };

export default useCreateEmployeeDataMutation;
