import type { FaApprovalRequest, FaApprovalStats } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetApprovalRequestsResponse = ApiResponse<{
  requests: FaApprovalRequest[];
  stats: FaApprovalStats;
}>;

interface GetApprovalRequestsParams {
  cursor?: string;
  limit?: number;
  organizationId: string;
  status?: string;
  type?: string;
}

export const getApprovalRequestsService = async ({
  cursor,
  limit,
  organizationId,
  status,
  type,
}: GetApprovalRequestsParams): Promise<GetApprovalRequestsResponse> => {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", String(limit));
  if (status) params.set("status", status);
  if (type) params.set("type", type);
  const qs = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/approvals${qs}`,
  });
};
