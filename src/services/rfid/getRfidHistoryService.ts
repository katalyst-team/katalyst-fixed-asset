import { RfidHistoryResponse } from "@/types/rfid";

import fetcher, { ApiResponse } from "..";

interface GetRfidHistoryParams {
  organizationId: string;
  rfidId: string;
  cursor?: string;
  limit?: number;
}

export const getRfidHistoryService = ({
  organizationId,
  rfidId,
  cursor,
  limit = 10,
}: GetRfidHistoryParams): Promise<ApiResponse<RfidHistoryResponse>> => {
  return fetcher({
    method: "GET",
    params: {
      cursor,
      limit,
    },
    url: `/v1/organizations/${organizationId}/rfids/${rfidId}/history`,
  });
};
