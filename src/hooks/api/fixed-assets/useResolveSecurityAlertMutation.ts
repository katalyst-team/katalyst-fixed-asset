import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  ResolveSecurityAlertResponse,
  resolveSecurityAlertService,
} from "@/services/fixed-assets/resolveSecurityAlertService";

interface UseResolveSecurityAlertMutationParams {
  organizationId: string;
}

interface ResolveSecurityAlertVariables {
  alertId: string;
  resolution_notes: string;
}

const useResolveSecurityAlertMutation = ({
  organizationId,
}: UseResolveSecurityAlertMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    ResolveSecurityAlertResponse,
    Error,
    ResolveSecurityAlertVariables
  >({
    mutationFn: ({ alertId, resolution_notes }) =>
      resolveSecurityAlertService({
        alertId,
        data: { resolution_notes },
        organizationId,
      }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Alert resolved successfully");
      queryClient.invalidateQueries({
        queryKey: ["faSecurityAlerts", organizationId],
      });
    },
  });
};

export default useResolveSecurityAlertMutation;
