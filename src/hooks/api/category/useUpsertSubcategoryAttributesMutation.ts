import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  UpsertSubcategoryAttributesParams,
  upsertSubcategoryAttributesService,
} from "@/services/category/upsertSubcategoryAttributesService";

import { KEY_USE_GET_CATEGORY_BY_ID } from "./useGetCategoryByIdQuery";
import { KEY_USE_GET_SUBCATEGORIES } from "./useGetSubcategoriesQuery";

const useUpsertSubcategoryAttributesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpsertSubcategoryAttributesParams) =>
      upsertSubcategoryAttributesService(params),
    onSuccess: (_, { category_id, organization_id }) => {
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_CATEGORY_BY_ID(organization_id, category_id),
      });
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_SUBCATEGORIES(organization_id, category_id),
      });
      queryClient.invalidateQueries({ queryKey: ["categoryData"] });
    },
  });
};

export default useUpsertSubcategoryAttributesMutation;
