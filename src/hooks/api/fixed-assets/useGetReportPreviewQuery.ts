import { useQuery } from "@tanstack/react-query";

import {
  GetReportPreviewResponse,
  getReportPreviewService,
} from "@/services/fixed-assets/getReportPreviewService";

interface UseGetReportPreviewQueryParams {
  enabled?: boolean;
  organizationId: string;
  reportId: string;
}

export const KEY_USE_GET_FA_REPORT_PREVIEW = (
  organizationId: string,
  reportId: string,
) => ["faReportPreview", organizationId, reportId];

const useGetReportPreviewQuery = ({
  enabled = true,
  organizationId,
  reportId,
}: UseGetReportPreviewQueryParams) => {
  return useQuery<GetReportPreviewResponse, Error>({
    enabled: Boolean(organizationId && reportId && enabled),
    queryFn: () => getReportPreviewService({ organizationId, reportId }),
    queryKey: KEY_USE_GET_FA_REPORT_PREVIEW(organizationId, reportId),
    staleTime: 60 * 1000,
  });
};

export default useGetReportPreviewQuery;
