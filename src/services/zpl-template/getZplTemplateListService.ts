import type { ZplTemplateType } from "@/types/zplTemplate";

import fetcher, { ApiResponse } from "..";

export type GetZplTemplateListResponse = ApiResponse<{
  zpl_templates: ZplTemplateType[];
}>;

interface GetZplTemplateListParams {
  organizationId: string;
}

export const getZplTemplateListService = async ({
  organizationId,
}: GetZplTemplateListParams): Promise<GetZplTemplateListResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/zpl-templates`,
  });
};
