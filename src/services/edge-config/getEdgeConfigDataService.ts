import {
  EdgeConfigFilterOptions,
  EdgeConfigResponse,
} from "@/types/edge-config";

import type { ApiResponse } from "..";
import fetcher from "..";

interface GetEdgeConfigDataParams {
  filters?: EdgeConfigFilterOptions;
  organizationId: string;
}

export const getEdgeConfigDataService = async ({
  filters,
  organizationId,
}: GetEdgeConfigDataParams): Promise<ApiResponse<EdgeConfigResponse>> => {
  const url = `/v1/organizations/${organizationId}/edge-config`;

  const params = new URLSearchParams();

  if (filters?.page) {
    params.append("page", filters.page.toString());
  }

  if (filters?.limit) {
    params.append("limit", filters.limit.toString());
  }

  const queryString = params.toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;

  return fetcher({
    method: "GET",
    url: fullUrl,
  });
};
