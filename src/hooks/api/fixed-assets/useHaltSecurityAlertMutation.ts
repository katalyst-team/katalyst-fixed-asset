import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  HaltSecurityAlertResponse,
  haltSecurityAlertService,
} from "@/services/fixed-assets/haltSecurityAlertService";

interface UseHaltSecurityAlertMutationParams {
  organizationId: string;
}

const useHaltSecurityAlertMutation = ({
  organizationId,
}: UseHaltSecurityAlertMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    HaltSecurityAlertResponse,
    Error,
    { alertId: string }
  >({
    mutationFn: ({ alertId }) =>
      haltSecurityAlertService({ alertId, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: (_, { alertId }) => {
      toast.success("Emergency halt issued — security team paged");
      queryClient.invalidateQueries({
        queryKey: ["faSecurityAlerts", organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["faSecurityAlerts", organizationId, alertId],
      });
    },
  });
};

export default useHaltSecurityAlertMutation;
