import type {
  FaRTLSFloorPlan,
  UpsertRTLSFloorPlanRequest,
} from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetRTLSFloorPlanResponse = ApiResponse<FaRTLSFloorPlan>;

export type UpsertRTLSFloorPlanResponse = ApiResponse<FaRTLSFloorPlan>;

interface GetRTLSFloorPlanParams {
  floor: string;
  organizationId: string;
  site_id: string;
}

interface UpsertRTLSFloorPlanParams {
  data: UpsertRTLSFloorPlanRequest;
  organizationId: string;
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

export const upsertRTLSFloorPlanService = async ({
  data,
  organizationId,
}: UpsertRTLSFloorPlanParams): Promise<UpsertRTLSFloorPlanResponse> => {
  return fetcher({
    data,
    method: "PUT",
    url: `/v1/organizations/${organizationId}/fa/rtls/floor-plan`,
  });
};
