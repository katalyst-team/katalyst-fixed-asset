import type { FaMasterDataSection, FaMasterDataSectionTab } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetFAMasterDataResponse = ApiResponse<{
  masterDataSections: FaMasterDataSection[];
}>;

interface GetFAMasterDataParams {
  organizationId: string;
  tab?: FaMasterDataSectionTab;
}

export const getFAMasterDataService = async ({
  organizationId,
  tab,
}: GetFAMasterDataParams): Promise<GetFAMasterDataResponse> => {
  const queryString = tab ? `?tab=${tab}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/master-data${queryString}`,
  });
};
