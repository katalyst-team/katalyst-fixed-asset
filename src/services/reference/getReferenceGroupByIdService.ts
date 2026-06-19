import { ReferenceGroupType } from "@/types/reference";

import fetcher, { ApiResponse } from "..";

export type GetReferenceGroupByIdResponse = ApiResponse<ReferenceGroupType>;

interface GetReferenceGroupByIdParams {
  groupId: string;
  organizationId: string;
}

export const getReferenceGroupByIdService = async ({
  groupId,
  organizationId,
}: GetReferenceGroupByIdParams): Promise<GetReferenceGroupByIdResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/reference-groups/${groupId}`,
  });
};
