import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { OrganizationSettings, updateOrganizationSettingsService } from "@/services/organization";

import { KEY_USE_GET_ORGANIZATION_SETTINGS } from "./useGetOrganizationSettingsQuery";

interface UseUpdateOrganizationSettingsParams {
  organizationId: string;
}

const useUpdateOrganizationSettingsMutation = ({
  organizationId,
}: UseUpdateOrganizationSettingsParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: OrganizationSettings) =>
      updateOrganizationSettingsService({ organizationId, settings }),
    onSuccess: () => {
      toast.success("Settings updated successfully");
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_ORGANIZATION_SETTINGS(organizationId),
      });
    },
  });
};

export default useUpdateOrganizationSettingsMutation;
