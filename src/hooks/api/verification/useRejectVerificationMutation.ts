import { useMutation, useQueryClient } from "@tanstack/react-query";

import { rejectVerificationService } from "@/services/verification";
import { VerificationActionParams } from "@/types/verification";

interface UseRejectVerificationMutationProps {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

const useRejectVerificationMutation = ({
  onSuccess,
  onError,
}: UseRejectVerificationMutationProps = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: VerificationActionParams) =>
      rejectVerificationService(params),
    onError,
    onSuccess: (_, { organizationId, storeId }) => {
      queryClient.invalidateQueries({
        queryKey: ["verification-pending", organizationId, storeId],
      });
      onSuccess?.();
    },
  });
};

export default useRejectVerificationMutation;
