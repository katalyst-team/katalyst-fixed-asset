import { PatchApiKeyDataParams } from "@/types/api-key";

import fetcher, { ApiResponse } from "..";

export type PatchApiKeyDataResponse = ApiResponse<{
  id: string;
  key: string;
  status: "ACTIVE" | "INACTIVE";
}>;

export const patchApiKeyDataService = async (
  params: PatchApiKeyDataParams
): Promise<PatchApiKeyDataResponse> => {
  const url = `/v1/organizations/${params.organizationID}/accounts/${params.accountOrganizationID}/api-keys/${params.keyID}`;
  return fetcher({
    data: {
      status: params.status,
    },
    method: "PATCH",
    url,
  });
};