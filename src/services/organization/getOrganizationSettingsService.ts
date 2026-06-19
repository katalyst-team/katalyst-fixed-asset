import fetcher, { ApiResponse } from "@/services";

export interface OrganizationSettings {
  critical_stock_threshold?: number;
  low_stock_threshold?: number;
  overstock_threshold?: number;
  aging_stock_days?: number;
  inventory_accuracy_target?: number;
  rit_number_enabled?: boolean;
}

export interface GetOrganizationSettingsResponse {
  settings: OrganizationSettings;
}

interface GetOrganizationSettingsParams {
  organizationId: string;
}

export const getOrganizationSettingsService = async ({
  organizationId,
}: GetOrganizationSettingsParams): Promise<
  ApiResponse<GetOrganizationSettingsResponse>
> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/settings`,
  });
};
