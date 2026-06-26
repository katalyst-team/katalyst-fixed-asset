import type { FaDepreciationSchedule } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetDepreciationScheduleResponse = ApiResponse<{
  schedules: FaDepreciationSchedule[];
}>;

interface GetDepreciationScheduleParams {
  assetId?: string;
  organizationId: string;
}

export const getDepreciationScheduleService = async ({
  assetId,
  organizationId,
}: GetDepreciationScheduleParams): Promise<GetDepreciationScheduleResponse> => {
  const qs = assetId ? `?asset_id=${assetId}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/finance/depreciation${qs}`,
  });
};
