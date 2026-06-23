import { useQuery } from "@tanstack/react-query";

import {
  GetEpcRangesResponse,
  getEpcRangesService,
} from "@/services/fixed-assets/getEpcRangesService";

interface UseGetEpcRangesQueryParams {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_EPC_RANGES = (organizationId: string) => [
  "faEpcRanges",
  organizationId,
];

const useGetEpcRangesQuery = ({
  enabled = true,
  organizationId,
}: UseGetEpcRangesQueryParams) => {
  return useQuery<GetEpcRangesResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getEpcRangesService({ organizationId }),
    queryKey: KEY_USE_GET_FA_EPC_RANGES(organizationId),
    staleTime: 60 * 1000,
  });
};

export default useGetEpcRangesQuery;
