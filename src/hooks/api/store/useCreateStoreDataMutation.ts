import { useMutation, UseMutationResult } from "@tanstack/react-query";

import {
  PostStoreDataParams,
  PostStoreDataResponse,
  postStoreDataService,
} from "@/services/store/createStoreDataService";

export type UseCreateStoreDataMutationResponse = UseMutationResult<
  PostStoreDataResponse,
  Error,
  PostStoreDataParams,
  unknown
>;

export const USE_CREATE_STORE_DATA_MUTATION_KEY = () => ["postStoreData"];

const useCreateStoreDataMutation = (): UseCreateStoreDataMutationResponse => {
  const mutation = useMutation({
    mutationFn: postStoreDataService,
    mutationKey: USE_CREATE_STORE_DATA_MUTATION_KEY(),
  });
  return mutation;
};

export default useCreateStoreDataMutation;
