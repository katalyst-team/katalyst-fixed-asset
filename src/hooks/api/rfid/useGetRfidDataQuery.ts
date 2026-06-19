import { useQuery } from "@tanstack/react-query";

import { getRfidDataService } from "@/services/rfid/getRfidDataService";
import { RfidFilterOptions, RfidListResponse } from "@/types/rfid";

interface UseGetRfidDataQueryParams {
  organizationId: string;
  filters?: RfidFilterOptions;
  enabled?: boolean;
}

export const KEY_USE_GET_RFID_DATA = (
  organizationId: string,
  filters: RfidFilterOptions | undefined
) => ["rfidData", organizationId, ...Object.values(filters || {})];

const useGetRfidDataQuery = ({
  organizationId,
  filters,
  enabled = true,
}: UseGetRfidDataQueryParams) => {
  return useQuery<RfidListResponse, Error>({
    enabled: Boolean(organizationId) && enabled,
    queryFn: () => getRfidDataService({ filters, organizationId }),
    queryKey: KEY_USE_GET_RFID_DATA(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetRfidDataQuery;
