import { useMutation, UseMutationResult } from "@tanstack/react-query";

import {
  PostColorDataParams,
  PostColorDataResponse,
  postColorDataService,
} from "@/services/category/color/postColorDataService";

export type UseCreateColorDataMutationResponse = UseMutationResult<
  PostColorDataResponse,
  Error,
  PostColorDataParams,
  unknown
>;

const useCreateColorDataMutation = () => {
  const mutation = useMutation({
    mutationFn: postColorDataService,
    mutationKey: ["postColorData"],
  });
  return mutation;
};

export default useCreateColorDataMutation;
