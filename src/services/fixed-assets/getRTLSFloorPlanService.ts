import type { FaRTLSFloorPlan } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetRTLSFloorPlanResponse = ApiResponse<FaRTLSFloorPlan>;

interface GetRTLSFloorPlanParams {
  floor: string;
  organizationId: string;
  site_id: string;
}

export const getRTLSFloorPlanService = async ({
  floor,
  organizationId,
  site_id,
}: GetRTLSFloorPlanParams): Promise<GetRTLSFloorPlanResponse> => {
  const params = new URLSearchParams();
  params.append("site_id", site_id);
  params.append("floor", floor);

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/rtls/floor-plan?${params.toString()}`,
  });
};
