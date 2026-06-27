import type { FaApprovalRequest, FaApprovalStats } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetApprovalRequestsResponse = ApiResponse<{
  requests: FaApprovalRequest[];
  summary: FaApprovalStats;
}>;

interface GetApprovalRequestsParams {
  limit?: number;
  myTasks?: boolean;
  organizationId: string;
  page?: number;
  search?: string;
  status?: string;
  type?: string;
}

export const getApprovalRequestsService = async ({
  limit,
  myTasks,
  organizationId,
  page,
  search,
  status,
  type,
}: GetApprovalRequestsParams): Promise<GetApprovalRequestsResponse> => {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (status) params.set("status", status);
  if (type) params.set("type", type);
  if (search) params.set("search", search);
  if (myTasks) params.set("my_tasks", "true");
  const qs = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/approvals${qs}`,
  });
};
