import { ReferenceItemListResponse } from "@/types/reference";

import fetcher, { ApiResponse } from "..";

export type GetReferenceItemsResponse = ApiResponse<ReferenceItemListResponse>;

interface GetReferenceItemsParams {
  cursor?: string;
  groupId: string;
  limit?: number;
  organizationId: string;
  related_to?: string;
  store_id?: string;
}

export const getReferenceItemsService = async ({
  cursor,
  groupId,
  limit,
  organizationId,
  related_to,
  store_id,
}: GetReferenceItemsParams): Promise<GetReferenceItemsResponse> => {
  const params = new URLSearchParams();
  if (cursor) params.append("cursor", cursor);
  if (limit) params.append("limit", limit.toString());
  if (related_to) params.append("related_to", related_to);
  if (store_id) params.append("store_id", store_id);
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/reference-groups/${groupId}/items${queryString}`,
  });
};
