import type { FaUserAuditLog, FaUserAuditLogFilterOptions } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetFAUserAuditLogResponse = ApiResponse<{ logs: FaUserAuditLog[] }>;

interface GetFAUserAuditLogParams extends FaUserAuditLogFilterOptions {
  organizationId: string;
}

export const getFAUserAuditLogService = async ({
  cursor,
  date_from,
  date_to,
  limit,
  organizationId,
  user_id,
}: GetFAUserAuditLogParams): Promise<GetFAUserAuditLogResponse> => {
  const params = new URLSearchParams();
  if (user_id) params.append("user_id", user_id);
  if (cursor) params.append("cursor", cursor);
  if (limit) params.append("limit", limit.toString());
  if (date_from) params.append("date_from", date_from);
  if (date_to) params.append("date_to", date_to);
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/users/audit-log${queryString}`,
  });
};
