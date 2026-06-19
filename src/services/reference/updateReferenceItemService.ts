import { UpdateReferenceItemRequest } from "@/types/reference";

import fetcher, { ApiResponse } from "..";

export type UpdateReferenceItemResponse = ApiResponse<{ id: string }>;

interface UpdateReferenceItemParams {
  data: UpdateReferenceItemRequest;
  groupId: string;
  itemId: string;
  organizationId: string;
  store_id?: string;
}

export const updateReferenceItemService = async ({
  data,
  groupId,
  itemId,
  organizationId,
  store_id,
}: UpdateReferenceItemParams): Promise<UpdateReferenceItemResponse> => {
  return fetcher({
    data: { ...data, ...(store_id ? { store_id } : {}) },
    method: "PATCH",
    url: `/v1/organizations/${organizationId}/reference-groups/${groupId}/items/${itemId}`,
  });
};
