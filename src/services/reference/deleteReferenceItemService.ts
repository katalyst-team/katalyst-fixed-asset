import fetcher, { ApiResponse } from "..";

export type DeleteReferenceItemResponse = ApiResponse<{ id: string }>;

interface DeleteReferenceItemParams {
  groupId: string;
  itemId: string;
  organizationId: string;
}

export const deleteReferenceItemService = async ({
  groupId,
  itemId,
  organizationId,
}: DeleteReferenceItemParams): Promise<DeleteReferenceItemResponse> => {
  return fetcher({
    method: "DELETE",
    url: `/v1/organizations/${organizationId}/reference-groups/${groupId}/items/${itemId}`,
  });
};
