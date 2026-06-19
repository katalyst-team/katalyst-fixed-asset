import { CreateReferenceGroupRequest } from "@/types/reference";

import fetcher, { ApiResponse } from "..";

export type CreateReferenceGroupResponse = ApiResponse<{ id: string }>;

interface CreateReferenceGroupParams {
  data: CreateReferenceGroupRequest;
  organizationId: string;
  store_id?: string;
}

export const createReferenceGroupService = async ({
  data,
  organizationId,
  store_id,
}: CreateReferenceGroupParams): Promise<CreateReferenceGroupResponse> => {
  return fetcher({
    data: { ...data, ...(store_id ? { store_id } : {}) },
    method: "POST",
    url: `/v1/organizations/${organizationId}/reference-groups`,
  });
};
