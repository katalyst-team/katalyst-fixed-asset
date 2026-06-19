import { useMutation, UseMutationResult } from "@tanstack/react-query";

import {
  PatchBrandDataParams,
  PatchBrandDataResponse,
  patchBrandDataService,
} from "@/services/category/brand/patchBrandDataService";

export type UseEditBrandDataMutationResponse = UseMutationResult<
  PatchBrandDataResponse,
  Error,
  PatchBrandDataParams,
  unknown
>;
export const USE_EDIT_BRAND_DATA_MUTATION_KEY = () => ["editBrandData"];

const useEditBrandDataMutation = (): UseEditBrandDataMutationResponse => {
  const mutation = useMutation({
    mutationFn: patchBrandDataService,
    mutationKey: USE_EDIT_BRAND_DATA_MUTATION_KEY(),
  });
  return mutation;
};

export default useEditBrandDataMutation;
