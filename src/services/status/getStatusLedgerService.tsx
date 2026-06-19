import fetcher from "@/services";
import { StatusLedgerResponse } from "@/types/statusLedger";

interface GetStatusLedgerParams {
  organizationId: string;
}

export const getStatusLedgerService = async ({
  organizationId,
}: GetStatusLedgerParams): Promise<StatusLedgerResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/statuses`,
  });
};
