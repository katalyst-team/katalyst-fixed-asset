import { CreateReferenceItemRequest } from "@/types/reference";

import fetcher, { ApiResponse } from "..";

export type CreateReferenceItemResponse = ApiResponse<{ id: string }>;

interface CreateReferenceItemParams {
  data: CreateReferenceItemRequest;
  groupId: string;
  organizationId: string;
  store_id?: string;
}

export const createReferenceItemService = async ({
  data,
  groupId,
  organizationId,
  store_id,
}: CreateReferenceItemParams): Promise<CreateReferenceItemResponse> => {
  return fetcher({
    data: { ...data, ...(store_id ? { store_id } : {}) },
    method: "POST",
    url: `/v1/organizations/${organizationId}/reference-groups/${groupId}/items`,
  });
};
