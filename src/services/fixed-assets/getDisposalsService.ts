import type {
  FaDisposalFilterOptions,
  FaDisposalItem,
  FaDisposalSummary,
} from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetDisposalsResponse = ApiResponse<{
  disposals: FaDisposalItem[];
  summary?: FaDisposalSummary;
}>;

interface GetDisposalsParams extends FaDisposalFilterOptions {
  organizationId: string;
}

export const getDisposalsService = async ({
  limit,
  organizationId,
  page,
  status,
}: GetDisposalsParams): Promise<GetDisposalsResponse> => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/disposals${queryString}`,
  });
};
