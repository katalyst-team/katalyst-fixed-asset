import { useMutation, UseMutationResult } from "@tanstack/react-query";

import {
  DeleteBrandDataParams,
  DeleteBrandDataResponse,
  deleteBrandDataService,
} from "@/services/category/brand/deleteBrandDataService";

export type UseDeleteBrandDataMutationResponse = UseMutationResult<
  DeleteBrandDataResponse,
  Error,
  DeleteBrandDataParams,
  unknown
>;
export const USE_DELETE_BRAND_DATA_MUTATION_KEY = () => ["deleteBrandData"];

const useDeleteBrandDataMutation = (): UseDeleteBrandDataMutationResponse => {
  const mutation = useMutation({
    mutationFn: deleteBrandDataService,
    mutationKey: USE_DELETE_BRAND_DATA_MUTATION_KEY(),
  });
  return mutation;
};

export default useDeleteBrandDataMutation;
