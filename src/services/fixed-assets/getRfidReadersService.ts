import type { FaRfidReader } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetRfidReadersResponse = ApiResponse<{ readers: FaRfidReader[] }>;

interface GetRfidReadersParams {
  organizationId: string;
}

export const getRfidReadersService = async ({
  organizationId,
}: GetRfidReadersParams): Promise<GetRfidReadersResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/rfid-readers`,
  });
};
