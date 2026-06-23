import fetcher, { ApiResponse } from "..";

export type ImportPOResponse = ApiResponse<{
  line_count: number;
  po_id: string;
}>;

interface ImportPOParams {
  file: File;
  organizationId: string;
}

export const importPOService = async ({
  file,
  organizationId,
}: ImportPOParams): Promise<ImportPOResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  return fetcher({
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/po/import`,
  });
};
