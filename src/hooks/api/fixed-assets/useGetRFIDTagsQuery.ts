import { useQuery } from "@tanstack/react-query";

import {
  GetRFIDTagsResponse,
  getRFIDTagsService,
} from "@/services/fixed-assets/getRFIDTagsService";
import type { FaRfidTagFilterOptions } from "@/types/fixed-assets";

interface UseGetRFIDTagsQueryParams extends FaRfidTagFilterOptions {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_RFID_TAGS = (
  organizationId: string,
  filters?: FaRfidTagFilterOptions,
) => ["faRfidTags", organizationId, JSON.stringify(filters ?? {})];

const useGetRFIDTagsQuery = ({
  asset_id,
  enabled = true,
  limit,
  organizationId,
  page,
  q,
  status,
}: UseGetRFIDTagsQueryParams) => {
  const filters: FaRfidTagFilterOptions = {
    asset_id,
    limit,
    page,
    q,
    status,
  };

  return useQuery<GetRFIDTagsResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getRFIDTagsService({ ...filters, organizationId }),
    queryKey: KEY_USE_GET_FA_RFID_TAGS(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetRFIDTagsQuery;
