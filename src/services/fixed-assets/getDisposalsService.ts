import type { FaDisposalFilterOptions, FaDisposalItem } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetDisposalsResponse = ApiResponse<{ disposals: FaDisposalItem[] }>;

interface GetDisposalsParams extends FaDisposalFilterOptions {
  organizationId: string;
}

export const getDisposalsService = async ({
  cursor,
  limit,
  organizationId,
  status,
}: GetDisposalsParams): Promise<GetDisposalsResponse> => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (cursor) params.append("cursor", cursor);
  if (limit) params.append("limit", limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/disposals${queryString}`,
  });
};
