import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  UpdateFASettingsResponse,
  updateFASettingsService,
} from "@/services/fixed-assets/updateFASettingsService";
import type { FaSettings } from "@/types/fixed-assets";

interface UseUpdateFASettingsMutationParams {
  organizationId: string;
}

const useUpdateFASettingsMutation = ({
  organizationId,
}: UseUpdateFASettingsMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateFASettingsResponse,
    Error,
    Partial<FaSettings>
  >({
    mutationFn: (data) => updateFASettingsService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Settings updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["faSettings", organizationId],
      });
    },
  });
};

export default useUpdateFASettingsMutation;
