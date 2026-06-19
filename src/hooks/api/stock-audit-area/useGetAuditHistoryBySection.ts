import { useQuery } from "@tanstack/react-query";

import { getAuditHistoryBySection } from "@/services/stock-audit-area";
import {
  AuditHistoryFilterOptions,
  AuditHistoryResponse,
} from "@/types/stock-audit-area";

export const KEY_USE_GET_AUDIT_HISTORY_BY_SECTION = (
  organizationId: string,
  storeId: string,
  sectionId: string,
  filters?: AuditHistoryFilterOptions
) => [
  "audit-history-by-section",
  organizationId,
  storeId,
  sectionId,
  JSON.stringify(filters),
];

interface UseGetAuditHistoryBySectionProps {
  organizationId: string;
  storeId: string;
  sectionId: string;
  filters?: AuditHistoryFilterOptions;
  enabled?: boolean;
}

const useGetAuditHistoryBySection = ({
  organizationId,
  storeId,
  sectionId,
  filters,
  enabled = true,
}: UseGetAuditHistoryBySectionProps) => {
  return useQuery<AuditHistoryResponse>({
    enabled: !!organizationId && !!storeId && !!sectionId && enabled,
    queryFn: () =>
      getAuditHistoryBySection({
        filters,
        organizationId,
        sectionId,
        storeId,
      }),
    queryKey: KEY_USE_GET_AUDIT_HISTORY_BY_SECTION(
      organizationId,
      storeId,
      sectionId,
      filters
    ),
  });
};

export default useGetAuditHistoryBySection;
