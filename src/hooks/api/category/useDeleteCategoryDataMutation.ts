import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";

import {
  DeleteCategoryDataParams,
  DeleteCategoryDataResponse,
  deleteCategoryDataService,
} from "@/services/category/deleteCategoryDataService";

export type UseDeleteCategoryDataMutationResponse = UseMutationResult<
  DeleteCategoryDataResponse,
  Error,
  DeleteCategoryDataParams,
  unknown
>;

const useDeleteCategoryDataMutation = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteCategoryDataService,
    mutationKey: ["delete-category-data"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categoryData"] });
    },
  });
  return mutation;
};

export default useDeleteCategoryDataMutation;
