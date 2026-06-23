import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  ConnectIntegrationResponse,
  connectIntegrationService,
} from "@/services/fixed-assets/connectIntegrationService";

interface UseConnectIntegrationMutationParams {
  organizationId: string;
}

interface ConnectIntegrationVariables {
  data: Record<string, unknown>;
  type: "erp" | "active-directory" | "email";
}

const useConnectIntegrationMutation = ({
  organizationId,
}: UseConnectIntegrationMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    ConnectIntegrationResponse,
    Error,
    ConnectIntegrationVariables
  >({
    mutationFn: ({ data, type }) =>
      connectIntegrationService({ data, organizationId, type }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Integration connected successfully");
      queryClient.invalidateQueries({
        queryKey: ["faSettings", organizationId],
      });
    },
  });
};

export default useConnectIntegrationMutation;
