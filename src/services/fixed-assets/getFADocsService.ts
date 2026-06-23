import type { FaDocListItem } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetFADocsResponse = ApiResponse<{ docs: FaDocListItem[] }>;

interface GetFADocsParams {
  organizationId: string;
}

export const getFADocsService = async ({
  organizationId,
}: GetFADocsParams): Promise<GetFADocsResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/docs`,
  });
};
