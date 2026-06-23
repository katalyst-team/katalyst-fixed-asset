import { useQuery } from "@tanstack/react-query";

import {
  GetReportHistoryResponse,
  getReportHistoryService,
} from "@/services/fixed-assets/getReportHistoryService";

interface UseGetReportHistoryQueryParams {
  cursor?: string;
  enabled?: boolean;
  limit?: number;
  organizationId: string;
}

export const KEY_USE_GET_FA_REPORT_HISTORY = (
  organizationId: string,
  cursor?: string,
  limit?: number,
) => ["faReportHistory", organizationId, cursor, limit];

const useGetReportHistoryQuery = ({
  cursor,
  enabled = true,
  limit,
  organizationId,
}: UseGetReportHistoryQueryParams) => {
  return useQuery<GetReportHistoryResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getReportHistoryService({ cursor, limit, organizationId }),
    queryKey: KEY_USE_GET_FA_REPORT_HISTORY(organizationId, cursor, limit),
    staleTime: 60 * 1000,
  });
};

export default useGetReportHistoryQuery;
