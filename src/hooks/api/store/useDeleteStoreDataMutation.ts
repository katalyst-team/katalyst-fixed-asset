import { useMutation, UseMutationResult } from "@tanstack/react-query";

import {
  DeleteStoreDataParams,
  DeleteStoreDataResponse,
  deleteStoreDataService,
} from "@/services/store/deleteStoreDataService";

export type UseDeleteStoreDataMutationResponse = UseMutationResult<
  DeleteStoreDataResponse,
  Error,
  DeleteStoreDataParams,
  unknown
>;

export const USE_DELETE_STORE_DATA_MUTATION_KEY = () => ["deleteStoreData"];

const useDeleteStoreDataMutation = (): UseDeleteStoreDataMutationResponse => {
  const mutation = useMutation({
    mutationFn: deleteStoreDataService,
    mutationKey: USE_DELETE_STORE_DATA_MUTATION_KEY(),
  });
  return mutation;
};

export default useDeleteStoreDataMutation;
