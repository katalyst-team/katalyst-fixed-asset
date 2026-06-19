import { CreateReferenceItemRelationRequest } from "@/types/reference";

import fetcher, { ApiResponse } from "..";

export type CreateReferenceItemRelationResponse = ApiResponse<{ id: string }>;

interface CreateReferenceItemRelationParams {
  data: CreateReferenceItemRelationRequest;
  groupId: string;
  itemId: string;
  organizationId: string;
}

export const createReferenceItemRelationService = async ({
  data,
  groupId,
  itemId,
  organizationId,
}: CreateReferenceItemRelationParams): Promise<CreateReferenceItemRelationResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/reference-groups/${groupId}/items/${itemId}/relations`,
  });
};
