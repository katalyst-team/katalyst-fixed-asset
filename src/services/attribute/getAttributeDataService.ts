import { AttributeItemType } from "@/types/attribute";

import fetcher, { ApiResponse } from "..";

type AttributePagination = Omit<
  ApiResponse<unknown>["pagination"],
  "next_cursor" | "prev_cursor"
> & {
  next_cursor: string | null;
  prev_cursor: string | null;
};

export type GetAttributeDataResponse = Omit<
  ApiResponse<{ attributes: AttributeItemType[] | null }>,
  "pagination"
> & {
  pagination: AttributePagination;
};

interface GetAttributeDataParams {
  cursor?: string;
  direction?: string;
  limit?: number;
  organizationId: string;
  query?: string;
  store_id?: string;
  type?: string;
}

export const getAttributeDataService = async ({
  cursor,
  direction,
  limit,
  organizationId,
  query,
  store_id,
  type,
}: GetAttributeDataParams): Promise<GetAttributeDataResponse> => {
  const url = `/v1/organizations/${organizationId}/attributes`;

  const params = new URLSearchParams();
  if (direction) params.append("direction", direction);
  if (type) params.append("type", type);
  if (cursor) params.append("cursor", cursor);
  if (limit) params.append("limit", limit.toString());
  if (query) params.append("query", query);
  if (store_id) params.append("store_id", store_id);

  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: url + queryString,
  });
};
