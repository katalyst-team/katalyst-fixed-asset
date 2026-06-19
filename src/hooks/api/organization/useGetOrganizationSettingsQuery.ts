import { useQuery } from "@tanstack/react-query";

import {
  getOrganizationSettingsService,
  OrganizationSettings,
} from "@/services/organization/getOrganizationSettingsService";

interface UseGetOrganizationSettingsQueryParams {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_ORGANIZATION_SETTINGS = (organizationId: string) => [
  "organizationSettings",
  organizationId,
];

const useGetOrganizationSettingsQuery = ({
  enabled = true,
  organizationId,
}: UseGetOrganizationSettingsQueryParams) => {
  return useQuery<OrganizationSettings, Error>({
    enabled: enabled && Boolean(organizationId),
    queryFn: async () => {
      const response = await getOrganizationSettingsService({ organizationId });
      return response.data.settings;
    },
    queryKey: KEY_USE_GET_ORGANIZATION_SETTINGS(organizationId),
    staleTime: 5 * 60 * 1000,
  });
};

export default useGetOrganizationSettingsQuery;
