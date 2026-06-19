import { PostApiKeyDataParams } from "@/types/api-key";

import fetcher, { ApiResponse } from "..";

export type PostApiKeyDataResponse = ApiResponse<{
  id: string;
  key: string;
  status: "ACTIVE" | "INACTIVE";
}>;

export const postApiKeyDataService = async (
  params: PostApiKeyDataParams
): Promise<PostApiKeyDataResponse> => {
  const url = `/v1/organizations/${params.organization_id}/accounts/${params.account_organization_id}/api-keys`;
  return fetcher({
    data: {},
    method: "POST",
    url,
  });
};