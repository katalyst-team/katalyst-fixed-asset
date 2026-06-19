import { useMutation } from "@tanstack/react-query";

import {
  PatchSizeDataParams,
  patchSizeDataService,
} from "../../../../services/category/size/patchSizeDataService";

export const useEditSizeDataMutation = () => {
  return useMutation({
    mutationFn: (params: PatchSizeDataParams) => patchSizeDataService(params),
  });
};
