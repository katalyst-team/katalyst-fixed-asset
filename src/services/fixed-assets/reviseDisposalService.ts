import fetcher, { ApiResponse } from "..";

export type ReviseDisposalResponse = ApiResponse<Record<string, unknown>>;

interface ReviseDisposalParams {
  data: { notes: string };
  disposalId: string;
  organizationId: string;
}

export const reviseDisposalService = async ({
  data,
  disposalId,
  organizationId,
}: ReviseDisposalParams): Promise<ReviseDisposalResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/disposals/${disposalId}/revise`,
  });
};
