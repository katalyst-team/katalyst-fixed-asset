import type {
  FaActivityItem,
  FaCategoryStat,
  FaFinancialCategory,
  FaMaintenanceUpcoming,
  FaRfidRead,
  FaSite,
} from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetFADashboardResponse = ApiResponse<{
  activity: FaActivityItem[];
  categoryStats: FaCategoryStat[];
  financialCategories: FaFinancialCategory[];
  maintenanceUpcoming: FaMaintenanceUpcoming[];
  rfidReads: FaRfidRead[];
  sites: FaSite[];
}>;

interface GetFADashboardParams {
  organizationId: string;
}

export const getFADashboardService = async ({
  organizationId,
}: GetFADashboardParams): Promise<GetFADashboardResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/dashboard`,
  });
};
