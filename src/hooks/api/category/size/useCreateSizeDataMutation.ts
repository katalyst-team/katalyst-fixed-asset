import { useMutation } from "@tanstack/react-query";

import {
  PostSizeDataParams,
  postSizeDataService,
} from "../../../../services/category/size/postSizeDataService";

export const useCreateSizeDataMutation = () => {
  return useMutation({
    mutationFn: (params: PostSizeDataParams) => postSizeDataService(params),
  });
};
