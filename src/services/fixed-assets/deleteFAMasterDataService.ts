import type { FaMasterDataSectionTab } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type DeleteFAMasterDataResponse = ApiResponse<{ id: string }>;

interface DeleteFAMasterDataParams {
  id: string;
  organizationId: string;
  section: FaMasterDataSectionTab;
}

export const deleteFAMasterDataService = async ({
  id,
  organizationId,
  section,
}: DeleteFAMasterDataParams): Promise<DeleteFAMasterDataResponse> => {
  return fetcher({
    method: "DELETE",
    url: `/v1/organizations/${organizationId}/fa/master-data/${section}/${id}`,
  });
};
