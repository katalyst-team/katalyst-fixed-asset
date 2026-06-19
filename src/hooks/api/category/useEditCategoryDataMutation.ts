import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";

import {
  PatchCategoryDataParams,
  PatchCategoryDataResponse,
  patchCategoryDataService,
} from "@/services/category/patchCategoryDataService";

export type UseCreateCategoryDataMutationResponse = UseMutationResult<
  PatchCategoryDataResponse,
  Error,
  PatchCategoryDataParams,
  unknown
>;

const useCreateCategoryDataMutation = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: patchCategoryDataService,
    mutationKey: ["edit-category-data"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categoryData"] });
    },
  });
  return mutation;
};

export default useCreateCategoryDataMutation;
