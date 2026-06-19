import { useMutation, useQueryClient } from "@tanstack/react-query";

import { submitVerificationService } from "@/services/verification";
import { VerificationActionParams } from "@/types/verification";

interface UseSubmitVerificationMutationProps {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

const useSubmitVerificationMutation = ({
  onSuccess,
  onError,
}: UseSubmitVerificationMutationProps = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: VerificationActionParams) =>
      submitVerificationService(params),
    onError,
    onSuccess: (_, { organizationId, storeId }) => {
      queryClient.invalidateQueries({
        queryKey: ["verification-pending", organizationId, storeId],
      });
      onSuccess?.();
    },
  });
};

export default useSubmitVerificationMutation;
