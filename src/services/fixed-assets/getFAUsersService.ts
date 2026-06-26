import type { FaUser, FaUserFilterOptions } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetFAUsersResponse = ApiResponse<{ users: FaUser[] }>;

interface GetFAUsersParams extends FaUserFilterOptions {
  organizationId: string;
}

export const getFAUsersService = async ({
  limit,
  organizationId,
  page,
  q,
  role,
  status,
}: GetFAUsersParams): Promise<GetFAUsersResponse> => {
  const params = new URLSearchParams();
  if (q) params.append("q", q);
  if (role) params.append("role", role);
  if (status) params.append("status", status);
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/users${queryString}`,
  });
};
