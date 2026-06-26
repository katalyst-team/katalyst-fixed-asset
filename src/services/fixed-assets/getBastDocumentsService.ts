import type { FaBastDocument } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetBastDocumentsResponse = ApiResponse<{
  documents: FaBastDocument[];
}>;

interface GetBastDocumentsParams {
  organizationId: string;
  status?: string;
}

export const getBastDocumentsService = async ({
  organizationId,
  status,
}: GetBastDocumentsParams): Promise<GetBastDocumentsResponse> => {
  const qs = status ? `?status=${status}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/finance/bast${qs}`,
  });
};
