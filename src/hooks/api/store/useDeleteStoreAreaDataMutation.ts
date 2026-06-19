import { useMutation, UseMutationResult } from "@tanstack/react-query";

import {
  DeleteStoreAreaDataResponse,
  deleteStoreAreaDataService,
} from "@/services/store/deleteStoreAreaDataService";

interface DeleteStoreAreaDataParams {
  organizationId: string;
  storeId: string;
  areaId: string;
}

export type UseDeleteStoreAreaDataMutationResponse = UseMutationResult<
  DeleteStoreAreaDataResponse,
  Error,
  DeleteStoreAreaDataParams,
  unknown
>;

export const USE_DELETE_STORE_AREA_DATA_MUTATION_KEY = () => [
  "deleteStoreAreaData",
];

const useDeleteStoreAreaDataMutation =
  (): UseDeleteStoreAreaDataMutationResponse => {
    const mutation = useMutation({
      mutationFn: deleteStoreAreaDataService,
      mutationKey: USE_DELETE_STORE_AREA_DATA_MUTATION_KEY(),
    });
    return mutation;
  };

export default useDeleteStoreAreaDataMutation;
