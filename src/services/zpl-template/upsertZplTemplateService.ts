import type { UpsertZplTemplatePayload } from "@/types/zplTemplate";

import fetcher, { ApiResponse } from "..";
export type UpsertZplTemplateResponse = ApiResponse<{ id: string }>;

interface UpsertZplTemplateParams {
  data: UpsertZplTemplatePayload;
  organizationId: string;
}

export const upsertZplTemplateService = async ({
  data,
  organizationId,
}: UpsertZplTemplateParams): Promise<UpsertZplTemplateResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/zpl-templates`,
  });
};
