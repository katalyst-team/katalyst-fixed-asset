import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  DeleteZplTemplateResponse,
  deleteZplTemplateService,
} from "@/services/zpl-template/deleteZplTemplateService";

import { KEY_USE_GET_ZPL_TEMPLATE_LIST } from "./useGetZplTemplateListQuery";

interface UseDeleteZplTemplateMutationParams {
  organizationId: string;
}

const useDeleteZplTemplateMutation = ({
  organizationId,
}: UseDeleteZplTemplateMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteZplTemplateResponse,
    Error,
    { zplTemplateId: string }
  >({
    mutationFn: ({ zplTemplateId }) =>
      deleteZplTemplateService({ organizationId, zplTemplateId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Template deleted");
      void queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_ZPL_TEMPLATE_LIST(organizationId),
      });
    },
  });
};

export default useDeleteZplTemplateMutation;
