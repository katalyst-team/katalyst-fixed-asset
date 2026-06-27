import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  type GenerateBastDocumentRequest,
  generateBastDocumentService,
} from "@/services/fixed-assets/generateBastDocumentService";

import { KEY_USE_GET_FA_BAST } from "./useGetBastDocumentsQuery";

interface UseGenerateBastDocumentMutationParams {
  organizationId: string;
}

const useGenerateBastDocumentMutation = ({
  organizationId,
}: UseGenerateBastDocumentMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateBastDocumentRequest) =>
      generateBastDocumentService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_FA_BAST(organizationId),
      });
      toast.success("BAST document generated");
    },
  });
};

export default useGenerateBastDocumentMutation;
