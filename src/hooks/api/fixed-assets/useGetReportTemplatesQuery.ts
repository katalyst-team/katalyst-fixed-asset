import { useQuery } from "@tanstack/react-query";

import {
  GetReportTemplatesResponse,
  getReportTemplatesService,
} from "@/services/fixed-assets/getReportTemplatesService";

interface UseGetReportTemplatesQueryParams {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_REPORT_TEMPLATES = (organizationId: string) => [
  "faReportTemplates",
  organizationId,
];

const useGetReportTemplatesQuery = ({
  enabled = true,
  organizationId,
}: UseGetReportTemplatesQueryParams) => {
  return useQuery<GetReportTemplatesResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getReportTemplatesService({ organizationId }),
    queryKey: KEY_USE_GET_FA_REPORT_TEMPLATES(organizationId),
    staleTime: 5 * 60 * 1000,
  });
};

export default useGetReportTemplatesQuery;
