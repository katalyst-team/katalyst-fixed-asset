import { useQuery } from "@tanstack/react-query";

import { ApiResponse } from "@/services";
import { getRfidHistoryService } from "@/services/rfid/getRfidHistoryService";
import { RfidHistoryResponse } from "@/types/rfid";

interface UseGetRfidHistoryQueryParams {
  organizationId: string;
  rfidId: string;
  cursor?: string;
  limit?: number;
  enabled?: boolean;
}

export const KEY_USE_GET_RFID_HISTORY = (
  organizationId: string,
  rfidId: string,
  cursor?: string,
  limit?: number
) => ["rfidHistory", organizationId, rfidId, cursor, limit];

const useGetRfidHistoryQuery = ({
  organizationId,
  rfidId,
  cursor,
  limit = 10,
  enabled = true,
}: UseGetRfidHistoryQueryParams) => {
  return useQuery<ApiResponse<RfidHistoryResponse>, Error>({
    enabled: Boolean(organizationId) && Boolean(rfidId) && enabled,
    queryFn: () =>
      getRfidHistoryService({
        cursor,
        limit,
        organizationId,
        rfidId,
      }),
    queryKey: KEY_USE_GET_RFID_HISTORY(
      organizationId,
      rfidId,
      cursor,
      limit
    ),
    staleTime: 60 * 1000,
  });
};

export default useGetRfidHistoryQuery;
