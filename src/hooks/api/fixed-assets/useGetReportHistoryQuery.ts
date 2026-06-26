import { useQuery } from "@tanstack/react-query";

import {
  GetReportHistoryResponse,
  getReportHistoryService,
} from "@/services/fixed-assets/getReportHistoryService";

interface UseGetReportHistoryQueryParams {
  enabled?: boolean;
  limit?: number;
  organizationId: string;
  page?: number;
}

export const KEY_USE_GET_FA_REPORT_HISTORY = (
  organizationId: string,
  page?: number,
  limit?: number,
) => ["faReportHistory", organizationId, page, limit];

const useGetReportHistoryQuery = ({
  enabled = true,
  limit,
  organizationId,
  page,
}: UseGetReportHistoryQueryParams) => {
  return useQuery<GetReportHistoryResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getReportHistoryService({ limit, organizationId, page }),
    queryKey: KEY_USE_GET_FA_REPORT_HISTORY(organizationId, page, limit),
    staleTime: 60 * 1000,
  });
};

export default useGetReportHistoryQuery;
