import { useQuery } from "@tanstack/react-query";

import {
  GetReportDataResponse,
  getReportDataService,
} from "@/services/report/getReportDataService";
import { ReportFilterOptions } from "@/types/report";

interface UseGetReportDataQueryParams {
  organizationId: string;
  storeId: string;
  filters?: ReportFilterOptions;
}

export const KEY_USE_GET_REPORT_DATA = (
  organizationId: string,
  storeId: string,
  filters?: ReportFilterOptions,
) => ["reportData", organizationId, storeId, JSON.stringify(filters)];

const useGetReportDataQuery = ({
  organizationId,
  storeId,
  filters,
}: UseGetReportDataQueryParams) => {
  // Only fetch when all required filters are provided
  const hasAllRequiredFilters =
    Boolean(filters?.category_id) &&
    Boolean(filters?.stock_movement_direction) &&
    Boolean(filters?.start_date) &&
    Boolean(filters?.end_date);

  return useQuery<GetReportDataResponse, Error>({
    enabled:
      Boolean(organizationId) && Boolean(storeId) && hasAllRequiredFilters,
    queryFn: () =>
      getReportDataService({
        filters,
        organizationId,
        storeId,
      }),
    queryKey: KEY_USE_GET_REPORT_DATA(organizationId, storeId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetReportDataQuery;
