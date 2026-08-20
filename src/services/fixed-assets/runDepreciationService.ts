import fetcher, { ApiResponse } from "..";

export type RunDepreciationResponse = ApiResponse<{
  posted_count: number;
  total_depreciation: number;
}>;

interface RunDepreciationParams {
  organizationId: string;
}

export const runDepreciationService = async ({
  organizationId,
}: RunDepreciationParams): Promise<RunDepreciationResponse> => {
  return fetcher({
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/depreciation/run`,
  });
};
