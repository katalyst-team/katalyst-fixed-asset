import fetcher, { ApiResponse } from "..";

export type SignBastResponse = ApiResponse<{
  document_id: string;
  signed_at: string | null;
  signer_name: string | null;
  status: string;
}>;

interface SignBastParams {
  documentId: string;
  organizationId: string;
  signerName: string;
}

export const signBastService = async ({
  documentId,
  organizationId,
  signerName,
}: SignBastParams): Promise<SignBastResponse> => {
  return fetcher({
    data: { signer_name: signerName },
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/finance/bast/${documentId}/sign`,
  });
};
