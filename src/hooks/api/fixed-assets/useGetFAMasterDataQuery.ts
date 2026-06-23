import { useQuery } from "@tanstack/react-query";

import {
  GetFAMasterDataResponse,
  getFAMasterDataService,
} from "@/services/fixed-assets/getFAMasterDataService";
import type { FaMasterDataSectionTab } from "@/types/fixed-assets";

interface UseGetFAMasterDataQueryParams {
  enabled?: boolean;
  organizationId: string;
  tab?: FaMasterDataSectionTab;
}

export const KEY_USE_GET_FA_MASTER_DATA = (
  organizationId: string,
  tab?: FaMasterDataSectionTab,
) => ["faMasterData", organizationId, tab];

const useGetFAMasterDataQuery = ({
  enabled = true,
  organizationId,
  tab,
}: UseGetFAMasterDataQueryParams) => {
  return useQuery<GetFAMasterDataResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getFAMasterDataService({ organizationId, tab }),
    queryKey: KEY_USE_GET_FA_MASTER_DATA(organizationId, tab),
    staleTime: 60 * 1000,
  });
};

export default useGetFAMasterDataQuery;
