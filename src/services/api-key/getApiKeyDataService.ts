import { ApiKeyItemType, GetApiKeyDataParams } from "@/types/api-key";

import fetcher, { ApiResponse } from "..";

export interface GetApiKeyDataResponse
  extends ApiResponse<{ keys: ApiKeyItemType[] }> {
  keys: ApiKeyItemType[];
}

export const getApiKeyDataService = async ({
  organizationID,
  accountOrganizationID,
}: GetApiKeyDataParams): Promise<GetApiKeyDataResponse> => {
  const url = `/v1/organizations/${organizationID}/accounts/${accountOrganizationID}/api-keys`;
  return fetcher({
    method: "GET",
    url,
  });
};