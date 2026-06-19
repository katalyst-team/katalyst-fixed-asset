import { useMutation, UseMutationResult } from "@tanstack/react-query";

import {
  UpdateSkuDataParams,
  UpdateSkuDataResponse,
  updateSkuService,
} from "@/services/sku/updateSkuService";

export type UseUpdateSkuMutationResponse = UseMutationResult<
  UpdateSkuDataResponse,
  Error,
  UpdateSkuDataParams,
  unknown
>;
export const USE_UPDATE_SKU_DATA_MUTATION_KEY = () => ["updateSkuData"];

const useUpdateSkuMutation = (): UseUpdateSkuMutationResponse => {
  const mutation = useMutation({
    mutationFn: updateSkuService,
    mutationKey: USE_UPDATE_SKU_DATA_MUTATION_KEY(),
  });
  return mutation;
};

export default useUpdateSkuMutation;
