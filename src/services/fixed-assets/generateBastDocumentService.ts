import fetcher, { ApiResponse } from "..";

export interface GenerateBastDocumentRequest {
  document_type: string;
  handover_date?: string | null;
  recipient_name: string;
  recipient_role: string;
  reference_id?: string;
  reference_type: string;
}

export type GenerateBastDocumentResponse = ApiResponse<{
  document_id: string;
  download_url: string;
}>;

interface GenerateBastDocumentParams {
  data: GenerateBastDocumentRequest;
  organizationId: string;
}

export const generateBastDocumentService = async ({
  data,
  organizationId,
}: GenerateBastDocumentParams): Promise<GenerateBastDocumentResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/finance/bast/generate`,
  });
};
