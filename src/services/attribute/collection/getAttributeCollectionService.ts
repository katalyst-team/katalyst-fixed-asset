import { AttributeCollectionDetailResponse } from "@/types/attributeCollection";

import fetcher, { ApiResponse } from "../..";

export type GetAttributeCollectionResponse =
  ApiResponse<AttributeCollectionDetailResponse>;

interface GetAttributeCollectionParams {
  organizationId: string;
  attributeCollectionId: string;
  filters?: GetAttributeCollectionFiltersParams;
}

export interface GetAttributeCollectionFiltersParams {
  query?: string;
  limit?: number;
  cursor?: string;
}

export const getAttributeCollectionService = async ({
  organizationId,
  attributeCollectionId,
  filters,
}: GetAttributeCollectionParams): Promise<GetAttributeCollectionResponse> => {
  const params = new URLSearchParams();

  if (filters?.cursor) {
    params.append("cursor", filters.cursor);
  }

  if (filters?.limit) {
    params.append("limit", filters.limit.toString());
  }
  if (filters?.cursor) {
    params.append("cursor", filters.cursor);
  }

  const url = `/v1/organizations/${organizationId}/attribute-collections/${attributeCollectionId}`;
  return fetcher({
    method: "GET",
    params: params,
    url,
  });
};
