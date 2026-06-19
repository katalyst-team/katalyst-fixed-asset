import { useMutation, UseMutationResult } from "@tanstack/react-query";

import {
  DeleteSkuDataParams,
  DeleteSkuDataResponse,
  deleteSkuService,
} from "@/services/sku/deleteSkuService";

export type UseDeleteSkuMutationResponse = UseMutationResult<
  DeleteSkuDataResponse,
  Error,
  DeleteSkuDataParams,
  unknown
>;
export const USE_DELETE_SKU_DATA_MUTATION_KEY = () => ["deleteSkuData"];

const useDeleteSkuMutation = (): UseDeleteSkuMutationResponse => {
  const mutation = useMutation({
    mutationFn: deleteSkuService,
    mutationKey: USE_DELETE_SKU_DATA_MUTATION_KEY(),
  });
  return mutation;
};

export default useDeleteSkuMutation;
