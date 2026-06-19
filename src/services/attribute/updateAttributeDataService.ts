import { UpdateAttributeRequest } from "@/types/attribute";

import fetcher, { ApiResponse } from "..";

export interface UpdateAttributeDataResponse
  extends ApiResponse<{ id: string }> {
  id: string;
}

interface UpdateAttributeDataParams {
  organizationId: string;
  attributeId: string;
  data: UpdateAttributeRequest;
}

export const updateAttributeDataService = async ({
  organizationId,
  attributeId,
  data,
}: UpdateAttributeDataParams): Promise<UpdateAttributeDataResponse> => {
  const url = `/v1/organizations/${organizationId}/attributes/${attributeId}`;
  return fetcher({
    data,
    method: "PATCH",
    url,
  });
};
