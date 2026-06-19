import { SectionMetricsResponse } from "@/types/stock-audit-area";

import fetcher from "..";

export interface GetSectionMetricsParams {
  organizationId: string;
  storeId: string;
  sectionId: string;
}

export const getSectionMetrics = (
  params: GetSectionMetricsParams
): Promise<SectionMetricsResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${params.organizationId}/stores/${params.storeId}/section-direct-audits/${params.sectionId}/metrics`,
  });
};
