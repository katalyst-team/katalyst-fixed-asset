import fetcher, { ApiResponse } from "..";

export type DeleteZplTemplateResponse = ApiResponse<{ id: string }>;

interface DeleteZplTemplateParams {
  organizationId: string;
  zplTemplateId: string;
}

export const deleteZplTemplateService = async ({
  organizationId,
  zplTemplateId,
}: DeleteZplTemplateParams): Promise<DeleteZplTemplateResponse> => {
  return fetcher({
    method: "DELETE",
    url: `/v1/organizations/${organizationId}/zpl-templates/${zplTemplateId}`,
  });
};
