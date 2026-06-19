import fetcher, { ApiResponse } from "@/services";

import {
  GetOrganizationSettingsResponse,
  OrganizationSettings,
} from "./getOrganizationSettingsService";

interface UpdateOrganizationSettingsParams {
  organizationId: string;
  settings: OrganizationSettings;
}

export const updateOrganizationSettingsService = async ({
  organizationId,
  settings,
}: UpdateOrganizationSettingsParams): Promise<
  ApiResponse<GetOrganizationSettingsResponse>
> => {
  return fetcher({
    data: { settings },
    method: "PUT",
    url: `/v1/organizations/${organizationId}/settings`,
  });
};
