import { useQuery } from "@tanstack/react-query";

import { getSectionMetrics } from "@/services/stock-audit-area";
import { SectionMetricsResponse } from "@/types/stock-audit-area";

export const KEY_USE_GET_SECTION_METRICS = (
  organizationId: string,
  storeId: string,
  sectionId: string
) => ["section-metrics", organizationId, storeId, sectionId];

interface UseGetSectionMetricsProps {
  organizationId: string;
  storeId: string;
  sectionId: string;
  enabled?: boolean;
}

const useGetSectionMetrics = ({
  organizationId,
  storeId,
  sectionId,
  enabled = true,
}: UseGetSectionMetricsProps) => {
  return useQuery<SectionMetricsResponse>({
    enabled: !!organizationId && !!storeId && !!sectionId && enabled,
    queryFn: () =>
      getSectionMetrics({
        organizationId,
        sectionId,
        storeId,
      }),
    queryKey: KEY_USE_GET_SECTION_METRICS(organizationId, storeId, sectionId),
  });
};

export default useGetSectionMetrics;
