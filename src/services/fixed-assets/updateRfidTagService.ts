import type { FaRfidTag, UpdateFaRfidTagRequest } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type UpdateRfidTagResponse = ApiResponse<FaRfidTag>;

interface UpdateRfidTagParams {
  data: UpdateFaRfidTagRequest;
  organizationId: string;
  tagId: string;
}

export const updateRfidTagService = async ({
  data,
  organizationId,
  tagId,
}: UpdateRfidTagParams): Promise<UpdateRfidTagResponse> => {
  return fetcher({
    data,
    method: "PATCH",
    url: `/v1/organizations/${organizationId}/fa/rfid-tags/${tagId}`,
  });
};
