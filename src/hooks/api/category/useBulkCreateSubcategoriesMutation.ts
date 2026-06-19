import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  BulkCreateSubcategoriesParams,
  bulkCreateSubcategoriesService,
} from "@/services/category/bulkCreateSubcategoriesService";

import { KEY_USE_GET_SUBCATEGORIES } from "./useGetSubcategoriesQuery";

const useBulkCreateSubcategoriesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: BulkCreateSubcategoriesParams) =>
      bulkCreateSubcategoriesService(params),
    onSuccess: (_, { category_id, organization_id }) => {
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_SUBCATEGORIES(organization_id, category_id),
      });
      queryClient.invalidateQueries({ queryKey: ["categoryData"] });
    },
  });
};

export default useBulkCreateSubcategoriesMutation;
