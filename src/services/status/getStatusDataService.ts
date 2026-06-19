import fetcher from "@/services";
import { StatusLedgerResponse } from "@/types/statusLedger";

interface GetStatusDataParams {
  organizationId: string;
}

export const getStatusDataService = async ({
  organizationId,
}: GetStatusDataParams): Promise<StatusLedgerResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/statuses`,
  });
};