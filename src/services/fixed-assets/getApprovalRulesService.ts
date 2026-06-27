import type { FaApprovalRule } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetApprovalRulesResponse = ApiResponse<{
  rules: FaApprovalRule[];
}>;

interface GetApprovalRulesParams {
  approvalType?: string;
  isActive?: boolean;
  limit?: number;
  organizationId: string;
  page?: number;
  search?: string;
}

export const getApprovalRulesService = async ({
  approvalType,
  isActive,
  limit,
  organizationId,
  page,
  search,
}: GetApprovalRulesParams): Promise<GetApprovalRulesResponse> => {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (approvalType) params.set("approval_type", approvalType);
  if (typeof isActive === "boolean") params.set("is_active", String(isActive));
  if (search) params.set("search", search);
  const qs = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/approvals/rules${qs}`,
  });
};
