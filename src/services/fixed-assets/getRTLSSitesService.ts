import type { FaRTLSLocation } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetRTLSSitesResponse = ApiResponse<{ sites: FaRTLSLocation[] }>;

interface GetRTLSSitesParams {
  organizationId: string;
}

export const getRTLSSitesService = async ({
  organizationId,
}: GetRTLSSitesParams): Promise<GetRTLSSitesResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/rtls/sites`,
  });
};
