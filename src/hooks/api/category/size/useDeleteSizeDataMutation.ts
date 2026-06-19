import { useMutation } from "@tanstack/react-query";

import {
  DeleteSizeDataParams,
  deleteSizeDataService,
} from "../../../../services/category/size/deleteSizeDataService";

export const useDeleteSizeDataMutation = () => {
  return useMutation({
    mutationFn: (params: DeleteSizeDataParams) => deleteSizeDataService(params),
  });
};
