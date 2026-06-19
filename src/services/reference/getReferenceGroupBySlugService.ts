import { ReferenceGroupType } from "@/types/reference";

import fetcher, { ApiResponse } from "..";

export type GetReferenceGroupBySlugResponse = ApiResponse<ReferenceGroupType>;

interface GetReferenceGroupBySlugParams {
  organizationId: string;
  slug: string;
}

export const getReferenceGroupBySlugService = async ({
  organizationId,
  slug,
}: GetReferenceGroupBySlugParams): Promise<GetReferenceGroupBySlugResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/reference-groups/slug/${slug}`,
  });
};
