import { useQuery } from "@tanstack/react-query";

import {
  GetFAUserAuditLogResponse,
  getFAUserAuditLogService,
} from "@/services/fixed-assets/getFAUserAuditLogService";
import type { FaUserAuditLogFilterOptions } from "@/types/fixed-assets";

interface UseGetFAUserAuditLogQueryParams
  extends FaUserAuditLogFilterOptions {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_USER_AUDIT_LOG = (
  organizationId: string,
  filters?: FaUserAuditLogFilterOptions,
) => ["faUserAuditLog", organizationId, JSON.stringify(filters ?? {})];

const useGetFAUserAuditLogQuery = ({
  date_from,
  date_to,
  enabled = true,
  limit,
  organizationId,
  page,
  user_id,
}: UseGetFAUserAuditLogQueryParams) => {
  const filters: FaUserAuditLogFilterOptions = {
    date_from,
    date_to,
    limit,
    page,
    user_id,
  };

  return useQuery<GetFAUserAuditLogResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getFAUserAuditLogService({ ...filters, organizationId }),
    queryKey: KEY_USE_GET_FA_USER_AUDIT_LOG(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetFAUserAuditLogQuery;
