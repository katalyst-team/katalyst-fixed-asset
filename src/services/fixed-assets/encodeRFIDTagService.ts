import type { EncodeRFIDTagRequest, FaRfidTag } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type EncodeRFIDTagResponse = ApiResponse<{
  epc: string;
  tag: FaRfidTag;
  tid: string;
}>;

interface EncodeRFIDTagParams {
  data: EncodeRFIDTagRequest;
  organizationId: string;
}

export const encodeRFIDTagService = async ({
  data,
  organizationId,
}: EncodeRFIDTagParams): Promise<EncodeRFIDTagResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/rfid-tags/encode`,
  });
};
