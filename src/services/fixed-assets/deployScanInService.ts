import type { DeployScanInRequest, FaAsset } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type DeployScanInResponse = ApiResponse<{
  assets: FaAsset[];
  deployed_count: number;
  po_status: string;
}>;

interface DeployScanInParams {
  data: DeployScanInRequest;
  organizationId: string;
}

export const deployScanInService = async ({
  data,
  organizationId,
}: DeployScanInParams): Promise<DeployScanInResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/scan-in/deploy`,
  });
};
