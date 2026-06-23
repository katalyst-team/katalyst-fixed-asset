import type { FaSettings } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type UpdateFASettingsResponse = ApiResponse<FaSettings>;

interface UpdateFASettingsParams {
  data: Partial<FaSettings>;
  organizationId: string;
}

export const updateFASettingsService = async ({
  data,
  organizationId,
}: UpdateFASettingsParams): Promise<UpdateFASettingsResponse> => {
  return fetcher({
    data,
    method: "PUT",
    url: `/v1/organizations/${organizationId}/fa/settings`,
  });
};
