import { useMutation, useQueryClient } from "@tanstack/react-query";

import { replaceRfidService } from "@/services/rfid/replaceRfidService";

interface UseReplaceRfidMutationProps {
  onError?: (error: unknown) => void;
  onSuccess?: () => void;
}

const useReplaceRfidMutation = ({
  onError,
  onSuccess,
}: UseReplaceRfidMutationProps = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: replaceRfidService,
    onError,
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["rfidData", organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["productData"],
      });
      queryClient.invalidateQueries({
        queryKey: ["stockMovementData"],
      });
      onSuccess?.();
    },
  });
};

export default useReplaceRfidMutation;
