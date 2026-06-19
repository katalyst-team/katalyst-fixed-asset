import { useQuery } from "@tanstack/react-query";

import { getRfidDetailService } from "@/services/rfid/getRfidDetailService";
import { RfidDetailResponse } from "@/types/rfid";

interface UseGetRfidDetailQueryParams {
  organizationId: string;
  rfidId: string;
  enabled?: boolean;
}

export const KEY_USE_GET_RFID_DETAIL = (
  organizationId: string,
  rfidId: string
) => ["rfidDetail", organizationId, rfidId];

const useGetRfidDetailQuery = ({
  organizationId,
  rfidId,
  enabled = true,
}: UseGetRfidDetailQueryParams) => {
  return useQuery<RfidDetailResponse, Error>({
    enabled: Boolean(organizationId) && Boolean(rfidId) && enabled,
    queryFn: () => getRfidDetailService({ organizationId, rfidId }),
    queryKey: KEY_USE_GET_RFID_DETAIL(organizationId, rfidId),
    staleTime: 60 * 1000,
  });
};

export default useGetRfidDetailQuery;
