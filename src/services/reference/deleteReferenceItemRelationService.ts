import fetcher, { ApiResponse } from "..";

export type DeleteReferenceItemRelationResponse = ApiResponse<null>;

interface DeleteReferenceItemRelationParams {
  groupId: string;
  itemId: string;
  organizationId: string;
  relationId: string;
}

export const deleteReferenceItemRelationService = async ({
  groupId,
  itemId,
  organizationId,
  relationId,
}: DeleteReferenceItemRelationParams): Promise<DeleteReferenceItemRelationResponse> => {
  return fetcher({
    method: "DELETE",
    url: `/v1/organizations/${organizationId}/reference-groups/${groupId}/items/${itemId}/relations/${relationId}`,
  });
};
