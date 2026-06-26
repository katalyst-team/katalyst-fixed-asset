import { useQuery } from "@tanstack/react-query";

import {
  GetDepreciationScheduleResponse,
  getDepreciationScheduleService,
} from "@/services/fixed-assets/getDepreciationScheduleService";

interface UseGetDepreciationScheduleQueryParams {
  assetId?: string;
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_DEPRECIATION = (organizationId: string, assetId?: string) => [
  "faDepreciation",
  organizationId,
  assetId,
];

const useGetDepreciationScheduleQuery = ({
  assetId,
  enabled = true,
  organizationId,
}: UseGetDepreciationScheduleQueryParams) => {
  return useQuery<GetDepreciationScheduleResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () =>
      getDepreciationScheduleService({ assetId, organizationId }),
    queryKey: KEY_USE_GET_FA_DEPRECIATION(organizationId, assetId),
    staleTime: 60 * 1000,
  });
};

export default useGetDepreciationScheduleQuery;
