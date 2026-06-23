import type {
  CreateMasterDataRequest,
  FaMasterDataRow,
  FaMasterDataSectionTab,
} from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type CreateFAMasterDataResponse = ApiResponse<{ row: FaMasterDataRow }>;

interface CreateFAMasterDataParams {
  data: CreateMasterDataRequest;
  organizationId: string;
  section: FaMasterDataSectionTab;
}

export const createFAMasterDataService = async ({
  data,
  organizationId,
  section,
}: CreateFAMasterDataParams): Promise<CreateFAMasterDataResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/master-data/${section}`,
  });
};
