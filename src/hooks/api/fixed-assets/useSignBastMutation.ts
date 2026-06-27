import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import { signBastService } from "@/services/fixed-assets/signBastService";

import { KEY_USE_GET_FA_BAST } from "./useGetBastDocumentsQuery";

interface UseSignBastMutationParams {
  organizationId: string;
}

const useSignBastMutation = ({ organizationId }: UseSignBastMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { documentId: string; signerName: string }) =>
      signBastService({
        documentId: params.documentId,
        organizationId,
        signerName: params.signerName,
      }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_FA_BAST(organizationId),
      });
      toast.success("BAST document signed");
    },
  });
};

export default useSignBastMutation;
