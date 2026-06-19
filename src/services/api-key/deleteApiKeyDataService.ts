import { DeleteApiKeyDataParams } from "@/types/api-key";

import fetcher, { ApiResponse } from "..";

export type DeleteApiKeyDataResponse = ApiResponse<{
  id: string;
  key: string;
  status: "ACTIVE" | "INACTIVE";
}>;

export const deleteApiKeyDataService = async (
  params: DeleteApiKeyDataParams
): Promise<DeleteApiKeyDataResponse> => {
  const url = `/v1/organizations/${params.organizationID}/accounts/${params.accountOrganizationID}/api-keys/${params.keyID}`;
  return fetcher({
    method: "DELETE",
    url,
  });
};