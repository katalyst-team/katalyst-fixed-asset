import type {
  FaRTLSAnchor,
  FaRTLSPosition,
  FaRTLSPositionFilterOptions,
  FaRtlsSummary,
} from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetRTLSPositionsResponse = ApiResponse<{
  anchors: FaRTLSAnchor[];
  positions: FaRTLSPosition[];
  summary?: FaRtlsSummary;
}>;

interface GetRTLSPositionsParams extends FaRTLSPositionFilterOptions {
  organizationId: string;
}

export const getRTLSPositionsService = async ({
  floor,
  organizationId,
  site_id,
  zone,
}: GetRTLSPositionsParams): Promise<GetRTLSPositionsResponse> => {
  const params = new URLSearchParams();
  if (site_id) params.append("site_id", site_id);
  if (floor) params.append("floor", floor);
  if (zone) params.append("zone", zone);
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/rtls/positions${queryString}`,
  });
};
