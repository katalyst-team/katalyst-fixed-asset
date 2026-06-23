import type {
  CreateMasterDataRequest,
  FaMasterDataSectionTab,
} from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type UpdateFAMasterDataResponse = ApiResponse<Record<string, unknown>>;

interface UpdateFAMasterDataParams {
  data: Partial<CreateMasterDataRequest>;
  id: string;
  organizationId: string;
  section: FaMasterDataSectionTab;
}

export const updateFAMasterDataService = async ({
  data,
  id,
  organizationId,
  section,
}: UpdateFAMasterDataParams): Promise<UpdateFAMasterDataResponse> => {
  return fetcher({
    data,
    method: "PUT",
    url: `/v1/organizations/${organizationId}/fa/master-data/${section}/${id}`,
  });
};
