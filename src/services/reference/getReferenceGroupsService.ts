import { ReferenceGroupListResponse } from "@/types/reference";

import fetcher, { ApiResponse } from "..";

export type GetReferenceGroupsResponse = ApiResponse<ReferenceGroupListResponse>;

interface GetReferenceGroupsParams {
  cursor?: string;
  limit?: number;
  organizationId: string;
  store_id?: string;
}

export const getReferenceGroupsService = async ({
  cursor,
  limit,
  organizationId,
  store_id,
}: GetReferenceGroupsParams): Promise<GetReferenceGroupsResponse> => {
  const params = new URLSearchParams();
  if (cursor) params.append("cursor", cursor);
  if (limit) params.append("limit", limit.toString());
  if (store_id) params.append("store_id", store_id);
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/reference-groups${queryString}`,
  });
};
