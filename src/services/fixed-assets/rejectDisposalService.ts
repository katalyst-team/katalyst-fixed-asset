import fetcher, { ApiResponse } from "..";

export type RejectDisposalResponse = ApiResponse<Record<string, unknown>>;

interface RejectDisposalParams {
  data: { reason: string };
  disposalId: string;
  organizationId: string;
}

export const rejectDisposalService = async ({
  data,
  disposalId,
  organizationId,
}: RejectDisposalParams): Promise<RejectDisposalResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/disposals/${disposalId}/reject`,
  });
};
