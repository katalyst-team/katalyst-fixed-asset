import { useMutation, useQueryClient } from "@tanstack/react-query";

import { verifyVerificationService } from "@/services/verification";
import { VerificationActionParams } from "@/types/verification";

interface UseVerifyVerificationMutationProps {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

const useVerifyVerificationMutation = ({
  onSuccess,
  onError,
}: UseVerifyVerificationMutationProps = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: VerificationActionParams) =>
      verifyVerificationService(params),
    onError,
    onSuccess: (_, { organizationId, storeId }) => {
      queryClient.invalidateQueries({
        queryKey: ["verification-pending", organizationId, storeId],
      });
      onSuccess?.();
    },
  });
};

export default useVerifyVerificationMutation;
