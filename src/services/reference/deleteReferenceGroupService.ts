import fetcher, { ApiResponse } from "..";

export type DeleteReferenceGroupResponse = ApiResponse<{ id: string }>;

interface DeleteReferenceGroupParams {
  groupId: string;
  organizationId: string;
}

export const deleteReferenceGroupService = async ({
  groupId,
  organizationId,
}: DeleteReferenceGroupParams): Promise<DeleteReferenceGroupResponse> => {
  return fetcher({
    method: "DELETE",
    url: `/v1/organizations/${organizationId}/reference-groups/${groupId}`,
  });
};
