import type { FaBastDocument } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetBastDocumentsResponse = ApiResponse<{
  documents: FaBastDocument[];
}>;

interface GetBastDocumentsParams {
  limit?: number;
  organizationId: string;
  page?: number;
  referenceType?: string;
  status?: string;
}

export const getBastDocumentsService = async ({
  limit,
  organizationId,
  page,
  referenceType,
  status,
}: GetBastDocumentsParams): Promise<GetBastDocumentsResponse> => {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (status) params.set("status", status);
  if (referenceType) params.set("reference_type", referenceType);
  const qs = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/finance/bast${qs}`,
  });
};
