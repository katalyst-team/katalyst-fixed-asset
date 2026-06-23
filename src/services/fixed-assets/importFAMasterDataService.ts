import type { FaMasterDataSectionTab } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type ImportFAMasterDataResponse = ApiResponse<{
  errors?: Array<{ message: string; row: number }>;
  imported_count: number;
}>;

interface ImportFAMasterDataParams {
  file: File;
  organizationId: string;
  section: FaMasterDataSectionTab;
}

export const importFAMasterDataService = async ({
  file,
  organizationId,
  section,
}: ImportFAMasterDataParams): Promise<ImportFAMasterDataResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  return fetcher({
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/master-data/${section}/import`,
  });
};
