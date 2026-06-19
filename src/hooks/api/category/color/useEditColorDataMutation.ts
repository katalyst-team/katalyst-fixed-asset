import { useMutation, UseMutationResult } from "@tanstack/react-query";

import {
  PatchColorDataParams,
  PatchColorDataResponse,
  patchColorDataService,
} from "@/services/category/color/patchColorDataService";

export type UseEditColorDataMutationResponse = UseMutationResult<
  PatchColorDataResponse,
  Error,
  PatchColorDataParams,
  unknown
>;

const useEditColorDataMutation = () => {
  const mutation = useMutation({
    mutationFn: patchColorDataService,
    mutationKey: ["patchColorData"],
  });
  return mutation;
};

export default useEditColorDataMutation;
