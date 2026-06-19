import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";

import {
  PostCategoryDataResponse,
  postCategoryDataService,
} from "@/services/category/postCategoryDataService";

export type UseCreateCategoryDataMutationResponse = UseMutationResult<
  PostCategoryDataResponse,
  Error,
  void,
  unknown
>;

const useCreateCategoryDataMutation = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: postCategoryDataService,
    mutationKey: ["postCategoryData"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categoryData"] });
    },
  });
  return mutation;
};

export default useCreateCategoryDataMutation;
