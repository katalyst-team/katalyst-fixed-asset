import { useQuery } from "@tanstack/react-query";

import {
  GetRTLSFloorPlanResponse,
  getRTLSFloorPlanService,
} from "@/services/fixed-assets/getRTLSFloorPlanService";

interface UseGetRTLSFloorPlanQueryParams {
  enabled?: boolean;
  floor: string;
  organizationId: string;
  site_id: string;
}

export const KEY_USE_GET_FA_RTLS_FLOOR_PLAN = (
  organizationId: string,
  site_id: string,
  floor: string,
) => ["faRTLSFloorPlan", organizationId, site_id, floor];

const useGetRTLSFloorPlanQuery = ({
  enabled = true,
  floor,
  organizationId,
  site_id,
}: UseGetRTLSFloorPlanQueryParams) => {
  return useQuery<GetRTLSFloorPlanResponse, Error>({
    enabled: Boolean(organizationId && site_id && floor && enabled),
    queryFn: () => getRTLSFloorPlanService({ floor, organizationId, site_id }),
    queryKey: KEY_USE_GET_FA_RTLS_FLOOR_PLAN(organizationId, site_id, floor),
    staleTime: 5 * 60 * 1000,
  });
};

export default useGetRTLSFloorPlanQuery;
