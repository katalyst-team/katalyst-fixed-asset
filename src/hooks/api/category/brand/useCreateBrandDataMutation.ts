import { useMutation, UseMutationResult } from "@tanstack/react-query";

import {
  PostBrandDataParams,
  PostBrandDataResponse,
  postBrandDataService,
} from "@/services/category/brand/postBrandDataService";

export type UseCreateBrandDataMutationResponse = UseMutationResult<
  PostBrandDataResponse,
  Error,
  PostBrandDataParams,
  unknown
>;

export const USE_CREATE_BRAND_DATA_MUTATION_KEY = () => ["postBrandData"];

const useCreateBrandDataMutation = (): UseCreateBrandDataMutationResponse => {
  const mutation = useMutation({
    mutationFn: postBrandDataService,
    mutationKey: USE_CREATE_BRAND_DATA_MUTATION_KEY(),
  });
  return mutation;
};

export default useCreateBrandDataMutation;
