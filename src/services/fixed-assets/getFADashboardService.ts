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
  active_alerts: number;
  activity: FaActivityItem[];
  audit_progress_pct: number;
  category_stats: FaCategoryStat[];
  financial_categories: FaFinancialCategory[];
  maintenance_upcoming: FaMaintenanceUpcoming[];
  net_book_value: number;
  rfid_reads: FaRfidRead[];
  sites: FaSite[];
  total_acquisition: number;
  total_assets: number;
  utilization_pct: number;
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
