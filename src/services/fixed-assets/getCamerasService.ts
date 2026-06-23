import type { FaCamera } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetCamerasResponse = ApiResponse<{ cameras: FaCamera[] }>;

interface GetCamerasParams {
  organizationId: string;
}

export const getCamerasService = async ({
  organizationId,
}: GetCamerasParams): Promise<GetCamerasResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/security/cameras`,
  });
};
