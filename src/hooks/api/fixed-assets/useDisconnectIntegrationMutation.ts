import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  DisconnectIntegrationResponse,
  disconnectIntegrationService,
} from "@/services/fixed-assets/disconnectIntegrationService";

interface UseDisconnectIntegrationMutationParams {
  organizationId: string;
}

interface DisconnectIntegrationVariables {
  type: "erp" | "active-directory" | "email";
}

const useDisconnectIntegrationMutation = ({
  organizationId,
}: UseDisconnectIntegrationMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    DisconnectIntegrationResponse,
    Error,
    DisconnectIntegrationVariables
  >({
    mutationFn: ({ type }) =>
      disconnectIntegrationService({ organizationId, type }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Integration disconnected successfully");
      queryClient.invalidateQueries({
        queryKey: ["faSettings", organizationId],
      });
    },
  });
};

export default useDisconnectIntegrationMutation;
