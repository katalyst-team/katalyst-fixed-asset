import type { PrintRFIDTagsRequest } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type PrintRFIDTagsResponse = ApiResponse<{
  print_job_id: string;
  queued_count: number;
}>;

interface PrintRFIDTagsParams {
  data: PrintRFIDTagsRequest;
  organizationId: string;
}

export const printRFIDTagsService = async ({
  data,
  organizationId,
}: PrintRFIDTagsParams): Promise<PrintRFIDTagsResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/rfid-tags/print`,
  });
};
