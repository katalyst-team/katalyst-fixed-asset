import { RfidDetailResponse } from "@/types/rfid";

import fetcher from "..";

interface GetRfidDetailParams {
  organizationId: string;
  rfidId: string;
}

export const getRfidDetailService = async ({
  organizationId,
  rfidId,
}: GetRfidDetailParams): Promise<RfidDetailResponse> => {
  const url = `/v1/organizations/${organizationId}/rfids/${rfidId}`;

  return fetcher({
    method: "GET",
    url,
  });
};
