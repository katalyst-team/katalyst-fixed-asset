import { UpdateReferenceGroupRequest } from "@/types/reference";

import fetcher, { ApiResponse } from "..";

export type UpdateReferenceGroupResponse = ApiResponse<{ id: string }>;

interface UpdateReferenceGroupParams {
  data: UpdateReferenceGroupRequest;
  groupId: string;
  organizationId: string;
  store_id?: string;
}

export const updateReferenceGroupService = async ({
  data,
  groupId,
  organizationId,
  store_id,
}: UpdateReferenceGroupParams): Promise<UpdateReferenceGroupResponse> => {
  return fetcher({
    data: { ...data, ...(store_id ? { store_id } : {}) },
    method: "PATCH",
    url: `/v1/organizations/${organizationId}/reference-groups/${groupId}`,
  });
};
