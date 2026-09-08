import fetcher, { ApiResponse } from "..";

export interface FeatureFlagItem {
  key: string;
  description: string;
  is_enabled: boolean;
  global_enabled: boolean;
  org_override: boolean | null;
}

export type GetOrganizationFeatureFlagsResponse = ApiResponse<FeatureFlagItem[]>;

interface GetOrganizationFeatureFlagsParams {
  organizationId: string;
}

export const getOrganizationFeatureFlagsService = async ({
  organizationId,
}: GetOrganizationFeatureFlagsParams): Promise<GetOrganizationFeatureFlagsResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/feature-flags`,
  });
};
