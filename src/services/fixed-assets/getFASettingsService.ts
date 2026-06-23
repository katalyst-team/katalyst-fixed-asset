import type { FaSettings } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetFASettingsResponse = ApiResponse<FaSettings>;

interface GetFASettingsParams {
  organizationId: string;
}

export const getFASettingsService = async ({
  organizationId,
}: GetFASettingsParams): Promise<GetFASettingsResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/settings`,
  });
};
