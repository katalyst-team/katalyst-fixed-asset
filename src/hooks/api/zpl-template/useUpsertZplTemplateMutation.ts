import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toastError } from "@/services";
import {
  UpsertZplTemplateResponse,
  upsertZplTemplateService,
} from "@/services/zpl-template/upsertZplTemplateService";
import type { UpsertZplTemplatePayload } from "@/types/zplTemplate";

import { KEY_USE_GET_ZPL_TEMPLATE_LIST } from "./useGetZplTemplateListQuery";

interface UseUpsertZplTemplateMutationParams {
  organizationId: string;
}

const useUpsertZplTemplateMutation = ({
  organizationId,
}: UseUpsertZplTemplateMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<UpsertZplTemplateResponse, Error, UpsertZplTemplatePayload>({
    mutationFn: (data) =>
      upsertZplTemplateService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_ZPL_TEMPLATE_LIST(organizationId),
      });
    },
  });
};

export default useUpsertZplTemplateMutation;
