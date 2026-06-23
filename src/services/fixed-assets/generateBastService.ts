import fetcher, { ApiResponse } from "..";

export type GenerateBastResponse = ApiResponse<{ download_url: string }>;

interface GenerateBastParams {
  disposalId: string;
  organizationId: string;
}

export const generateBastService = async ({
  disposalId,
  organizationId,
}: GenerateBastParams): Promise<GenerateBastResponse> => {
  return fetcher({
    headers: { Accept: "application/pdf" },
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/disposals/${disposalId}/bast`,
  });
};
