import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  UpdateNotificationTriggersResponse,
  updateNotificationTriggersService,
} from "@/services/fixed-assets/updateNotificationTriggersService";
import type { FaNotificationTrigger } from "@/types/fixed-assets";

interface UseUpdateNotificationTriggersMutationParams {
  organizationId: string;
}

const useUpdateNotificationTriggersMutation = ({
  organizationId,
}: UseUpdateNotificationTriggersMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateNotificationTriggersResponse,
    Error,
    { triggers: FaNotificationTrigger[] }
  >({
    mutationFn: (data) =>
      updateNotificationTriggersService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Notification settings updated");
      queryClient.invalidateQueries({
        queryKey: ["faNotificationTriggers", organizationId],
      });
    },
  });
};

export default useUpdateNotificationTriggersMutation;
