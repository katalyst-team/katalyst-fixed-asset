import { useMutation, UseMutationResult } from "@tanstack/react-query";

import {
  CreateStoreAreaDataResponse,
  createStoreAreaDataService,
} from "@/services/store/createStoreAreaDataService";
import { PostStoreAreaDataParams } from "@/types/store";

export type UseCreateStoreAreaDataMutationResponse = UseMutationResult<
  CreateStoreAreaDataResponse,
  Error,
  PostStoreAreaDataParams,
  unknown
>;

export const USE_CREATE_STORE_AREA_DATA_MUTATION_KEY = () => [
  "postStoreAreaData",
];

const useCreateStoreAreaDataMutation =
  (): UseCreateStoreAreaDataMutationResponse => {
    const mutation = useMutation({
      mutationFn: createStoreAreaDataService,
      mutationKey: USE_CREATE_STORE_AREA_DATA_MUTATION_KEY(),
    });
    return mutation;
  };

export default useCreateStoreAreaDataMutation;
