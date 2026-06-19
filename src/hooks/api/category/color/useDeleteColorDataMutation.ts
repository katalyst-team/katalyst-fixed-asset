import { useMutation, UseMutationResult } from "@tanstack/react-query";

import {
  DeleteColorDataParams,
  DeleteColorDataResponse,
  deleteColorDataService,
} from "@/services/category/color/deleteColorDataService";

export type UseDeleteColorDataMutationResponse = UseMutationResult<
  DeleteColorDataResponse,
  Error,
  DeleteColorDataParams,
  unknown
>;

const useDeleteColorDataMutation = () => {
  const mutation = useMutation({
    mutationFn: deleteColorDataService,
    mutationKey: ["deleteColorData"],
  });
  return mutation;
};

export default useDeleteColorDataMutation;
