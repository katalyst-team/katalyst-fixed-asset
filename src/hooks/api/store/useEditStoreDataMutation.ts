import { useMutation, UseMutationResult } from "@tanstack/react-query";

import {
  PatchStoreDataParams,
  PatchStoreDataResponse,
  patchStoreDataService,
} from "@/services/store/patchStoreDataService";

export type UseEditStoreDataMutationResponse = UseMutationResult<
  PatchStoreDataResponse,
  Error,
  PatchStoreDataParams,
  unknown
>;

export const USE_EDIT_STORE_DATA_MUTATION_KEY = () => ["editStoreData"];

const useEditStoreDataMutation = (): UseEditStoreDataMutationResponse => {
  const mutation = useMutation({
    mutationFn: patchStoreDataService,
    mutationKey: USE_EDIT_STORE_DATA_MUTATION_KEY(),
  });
  return mutation;
};

export default useEditStoreDataMutation;
