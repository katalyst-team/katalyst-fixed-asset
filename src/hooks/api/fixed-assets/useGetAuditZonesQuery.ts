import { useQuery } from "@tanstack/react-query";

import {
  GetAuditZonesResponse,
  getAuditZonesService,
} from "@/services/fixed-assets/getAuditZonesService";

interface UseGetAuditZonesQueryParams {
  auditId?: string;
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_AUDIT_ZONES = (
  organizationId: string,
  auditId?: string,
) => ["faAuditZones", organizationId, auditId];

const useGetAuditZonesQuery = ({
  auditId,
  enabled = true,
  organizationId,
}: UseGetAuditZonesQueryParams) => {
  return useQuery<GetAuditZonesResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getAuditZonesService({ auditId, organizationId }),
    queryKey: KEY_USE_GET_FA_AUDIT_ZONES(organizationId, auditId),
    staleTime: 60 * 1000,
  });
};

export default useGetAuditZonesQuery;
