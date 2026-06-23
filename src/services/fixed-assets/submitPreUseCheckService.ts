import type { FaPreUseAsset, SubmitPreUseCheckRequest } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type SubmitPreUseCheckResponse = ApiResponse<{
  preUseCheck: FaPreUseAsset;
}>;

interface SubmitPreUseCheckParams {
  data: SubmitPreUseCheckRequest;
  organizationId: string;
}

export const submitPreUseCheckService = async ({
  data,
  organizationId,
}: SubmitPreUseCheckParams): Promise<SubmitPreUseCheckResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/pre-use-checks`,
  });
};
