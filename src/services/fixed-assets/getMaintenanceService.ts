import type {
  FaHealthItem,
  FaMaintenanceTab,
  FaPmRule,
  FaPmScheduleItem,
  FaPreUseAsset,
  FaWorkOrder,
} from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetMaintenanceResponse = ApiResponse<{
  healthData: FaHealthItem[];
  pmRules: FaPmRule[];
  pmSchedule: FaPmScheduleItem[];
  preUseAssets: FaPreUseAsset[];
  workOrders: FaWorkOrder[];
}>;

interface GetMaintenanceParams {
  organizationId: string;
  tab?: FaMaintenanceTab;
}

export const getMaintenanceService = async ({
  organizationId,
  tab,
}: GetMaintenanceParams): Promise<GetMaintenanceResponse> => {
  const queryString = tab ? `?tab=${tab}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/maintenance${queryString}`,
  });
};
