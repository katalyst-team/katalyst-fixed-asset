import { useMutation, UseMutationResult } from "@tanstack/react-query";

import {
  UpdateStoreAreaDataResponse,
  updateStoreAreaDataService,
} from "@/services/store/updateStoreAreaDataService";
import { PatchStoreAreaDataParams } from "@/types/store";

export type UseUpdateStoreAreaDataMutationResponse = UseMutationResult<
  UpdateStoreAreaDataResponse,
  Error,
  PatchStoreAreaDataParams,
  unknown
>;

export const USE_UPDATE_STORE_AREA_DATA_MUTATION_KEY = () => [
  "updateStoreAreaData",
];

const useUpdateStoreAreaDataMutation =
  (): UseUpdateStoreAreaDataMutationResponse => {
    const mutation = useMutation({
      mutationFn: updateStoreAreaDataService,
      mutationKey: USE_UPDATE_STORE_AREA_DATA_MUTATION_KEY(),
    });
    return mutation;
  };

export default useUpdateStoreAreaDataMutation;
