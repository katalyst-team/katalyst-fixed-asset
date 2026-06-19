import { ColorItemType } from "@/types/color";

import fetcher, { ApiResponse } from "../..";

export type GetColorDataResponse = ApiResponse<{ color: ColorItemType[] }>;

export const getColorDataService = async (
  organizationId: string
): Promise<GetColorDataResponse> => {
  const url = `/v1/organizations/${organizationId}/colors`;
  return fetcher({
    method: "GET",
    url,
  });
};
