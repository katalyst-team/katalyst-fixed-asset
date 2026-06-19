import { ReferenceItemRelationListResponse } from "@/types/reference";

import fetcher, { ApiResponse } from "..";

export type GetReferenceItemRelationsResponse =
  ApiResponse<ReferenceItemRelationListResponse>;

interface GetReferenceItemRelationsParams {
  groupId: string;
  itemId: string;
  organizationId: string;
}

export const getReferenceItemRelationsService = async ({
  groupId,
  itemId,
  organizationId,
}: GetReferenceItemRelationsParams): Promise<GetReferenceItemRelationsResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/reference-groups/${groupId}/items/${itemId}/relations`,
  });
};
