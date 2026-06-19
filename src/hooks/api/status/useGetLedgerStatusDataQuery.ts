import { useQuery } from "@tanstack/react-query";

import { getStatusLedgerService } from "@/services/status/getStatusLedgerService";
import { StatusLedgerResponse } from "@/types/statusLedger";

interface UseGetStatusLedgerDataQueryParams {
  organizationId: string;
}

export const KEY_USE_GET_STATUS_LEDGER_DATA = (organizationId: string) => [
  "statusLedgerData",
  organizationId,
];

const useGetStatusLedgerDataQuery = ({
  organizationId,
}: UseGetStatusLedgerDataQueryParams) => {
  return useQuery<StatusLedgerResponse, Error>({
    enabled: Boolean(organizationId),
    queryFn: () =>
      getStatusLedgerService({
        organizationId,
      }),
    queryKey: KEY_USE_GET_STATUS_LEDGER_DATA(organizationId),
    staleTime: 60 * 1000,
  });
};

export default useGetStatusLedgerDataQuery;
